import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createChat,
  addMessage,
  getMessagesByChat,
  findActiveChatByEmail,
  markPreviousChatsInactive,
} from "@/lib/database-prisma";
import {
  getChatbotResponseStream,
  makeDecision,
  ChatMessage,
} from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, isNewChat, sessionEmail, forceNewConversation } =
      await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    let currentChatId = chatId;

    // Handle new chat creation (same logic as regular route)
    if (isNewChat || !currentChatId || forceNewConversation) {
      if (sessionEmail && !forceNewConversation) {
        const existingChat = await findActiveChatByEmail(sessionEmail);
        if (existingChat) {
          currentChatId = existingChat.id;
        }
      }

      if (!currentChatId || forceNewConversation) {
        const newChatId = uuidv4();
        
        if (sessionEmail && !forceNewConversation) {
          await markPreviousChatsInactive(sessionEmail, newChatId);
        }

        await createChat(newChatId, sessionEmail || "anonymous");
        currentChatId = newChatId;
      }
    }

    // Add user message to database
    await addMessage(currentChatId, message, "user");

    // Get existing messages for context
    const existingMessages = await getMessagesByChat(currentChatId);
    const openaiMessages: ChatMessage[] = existingMessages
      .filter((msg) => msg.sender !== "admin")
      .slice(-10) // Keep last 10 messages for context
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    // Create streaming response
    const encoder = new TextEncoder();
    let fullBotResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial data with chat ID
          const initialData = {
            type: "init",
            chatId: currentChatId,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
          );

          // Stream the bot response
          for await (const chunk of getChatbotResponseStream(openaiMessages)) {
            fullBotResponse += chunk;
            
            const chunkData = {
              type: "chunk",
              content: chunk,
            };
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`)
            );
          }

          // Save complete bot response to database
          await addMessage(currentChatId, fullBotResponse, "bot");

          // Get conversation context for decision making
          const conversationLength = existingMessages.length + 2; // +2 for current user and bot messages
          
          // Use enhanced decision engine
          const decision = makeDecision({
            userMessage: message,
            botResponse: fullBotResponse,
            conversationLength,
            timeOfDay: new Date()
          });
          
          const shouldEscalate = decision.action === 'escalate' && decision.confidence >= 60;
          const requestsFollowUp = decision.action === 'followup' && decision.confidence >= 60;

          // Send final data with decision results
          const finalData = {
            type: "complete",
            shouldEscalate,
            requestsFollowUp,
            decision: {
              action: decision.action,
              confidence: decision.confidence,
              reason: decision.reason
            }
          };
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = {
            type: "error",
            error: "Internal server error"
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Chat streaming API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
