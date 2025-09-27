import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";
import { setUserOnline, setUserOffline } from "./src/lib/database-prisma";

interface SendMessageData {
  chatId: string;
  content: string;
  sender: "user" | "bot" | "admin";
}

interface AdminInterventionData {
  chatId: string;
  message: string;
}

interface SocketWithChatId extends Socket {
  chatId?: string;
}

declare global {
  var io: Server | undefined;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: SocketWithChatId) => {
    console.log("Client connected:", socket.id);

    socket.on("join-chat", async (chatId: string) => {
      socket.join(chatId);
      socket.chatId = chatId; // Store chatId on socket for cleanup
      console.log(`Client ${socket.id} joined chat: ${chatId}`);

      // Update user online status in database
      try {
        await setUserOnline(chatId);
        console.log(`User set online for chat: ${chatId}`);
      } catch (error) {
        console.error("Error setting user online:", error);
      }

      // Notify others in the room and admin
      const userCount = io.sockets.adapter.rooms.get(chatId)?.size || 1;
      socket.to(chatId).emit("user-joined", {
        chatId,
        userCount,
      });

      // Notify admin dashboard of user activity
      io.to("admin-room").emit("user-activity-changed", {
        chatId,
        isOnline: true,
        userCount,
      });
    });

    socket.on("leave-chat", async (chatId: string) => {
      socket.leave(chatId);
      console.log(`Client ${socket.id} left chat: ${chatId}`);

      // Update user offline status in database
      try {
        await setUserOffline(chatId);
        console.log(`User set offline for chat: ${chatId}`);

        // Notify admin dashboard of user activity
        io.to("admin-room").emit("user-activity-changed", {
          chatId,
          isOnline: false,
          userCount: 0,
        });
      } catch (error) {
        console.error("Error setting user offline:", error);
      }
    });

    socket.on("join-admin", () => {
      socket.join("admin-room");
      console.log(`Admin ${socket.id} joined admin room`);
    });

    socket.on("send-message", (data: SendMessageData) => {
      console.log(`Message from ${socket.id}:`, data);

      io.to(data.chatId).emit("new-message", {
        chatId: data.chatId,
        message: {
          id: `msg_${Date.now()}`,
          content: data.content,
          sender: data.sender,
          timestamp: new Date().toISOString(),
          messageType: "text",
        },
      });
    });

    socket.on("admin-intervention", (data: AdminInterventionData) => {
      console.log(`Admin intervention from ${socket.id}:`, data);

      io.to(data.chatId).emit("admin-intervention", {
        chatId: data.chatId,
        message: {
          id: `admin_${Date.now()}`,
          content: data.message,
          sender: "admin",
          timestamp: new Date().toISOString(),
        },
      });
    });

    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);

      // If user was in a chat, mark them as offline
      const socketChatId = socket.chatId;
      if (socketChatId) {
        try {
          await setUserOffline(socketChatId);
          console.log(
            `User set offline due to disconnect for chat: ${socketChatId}`
          );

          // Notify admin dashboard of user activity
          io.to("admin-room").emit("user-activity-changed", {
            chatId: socketChatId,
            isOnline: false,
            userCount: 0,
          });
        } catch (error) {
          console.error("Error setting user offline on disconnect:", error);
        }
      }
    });
  });

  // Make io available globally for API routes
  (global as typeof globalThis).io = io;

  server
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server ready`);
    });
});
