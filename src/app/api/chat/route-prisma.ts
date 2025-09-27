import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createChat,
  addMessage,
  getMessagesByChat,
} from "@/lib/database-prisma";
import {
  getChatbotResponse,
  shouldEscalateToHuman,
  wantsFollowUpCall,
  ChatMessage,
} from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, isNewChat } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let currentChatId = chatId;

    // Create new chat if needed
    if (isNewChat || !currentChatId) {
      currentChatId = uuidv4();
      await createChat(currentChatId);
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

    // Check if should escalate or request follow-up
    const shouldEscalate = shouldEscalateToHuman(message, botResponse);
    const requestsFollowUp = wantsFollowUpCall(message, botResponse);

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
