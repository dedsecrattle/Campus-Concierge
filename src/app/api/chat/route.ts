import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createChat,
  addMessage,
  getMessagesByChat,
  findActiveChatByEmail,
  markPreviousChatsInactive,
} from "@/lib/database-prisma";
import { getChatbotResponse, makeDecision, ChatMessage } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, isNewChat, sessionEmail, forceNewConversation } =
      await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let currentChatId = chatId;

    // Handle chat session logic
    if (isNewChat || !currentChatId) {
      // If user explicitly wants a new conversation, always create one
      if (forceNewConversation) {
        currentChatId = uuidv4();
        await createChat(currentChatId, sessionEmail);
        // Mark previous chats as inactive for this user
        if (sessionEmail) {
          await markPreviousChatsInactive(sessionEmail, currentChatId);
        }
      }
      // If user has a session email, check for existing active chat first
      else if (sessionEmail) {
        const existingActiveChat = await findActiveChatByEmail(sessionEmail);
        if (existingActiveChat) {
          // Continue existing conversation instead of creating new one
          currentChatId = existingActiveChat.id;
        } else {
          // No active chat found, create a new one
          currentChatId = uuidv4();
          await createChat(currentChatId, sessionEmail);
        }
      } else {
        // No session email, create anonymous chat
        currentChatId = uuidv4();
        await createChat(currentChatId, sessionEmail);
      }
    }

    // Add user message to database
    await addMessage(currentChatId, message, "user");

    // Get chat history for context
    const chatHistory = await getMessagesByChat(currentChatId);

    // Convert to OpenAI format (excluding system messages)
    const openaiMessages: ChatMessage[] = chatHistory
      .filter((msg) => msg.sender !== "admin" && msg.messageType !== "system")
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

    // Get chatbot response
    const botResponse = await getChatbotResponse(openaiMessages);

    // Add bot message to database
    await addMessage(currentChatId, botResponse, "bot");

    // Get conversation context for better decision making
    const existingMessages = await getMessagesByChat(currentChatId);
    const conversationLength = existingMessages.length;

    // Use enhanced decision engine
    const decision = makeDecision({
      userMessage: message,
      botResponse,
      conversationLength,
      timeOfDay: new Date(),
    });

    // Backward compatibility with existing logic
    const shouldEscalate =
      decision.action === "escalate" && decision.confidence >= 50;
    const requestsFollowUp =
      decision.action === "followup" && decision.confidence >= 50;

    return NextResponse.json({
      chatId: currentChatId,
      message: botResponse,
      shouldEscalate,
      requestsFollowUp,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    const messages = await getMessagesByChat(chatId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get chat messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
