
import { Server } from "socket.io";
import Message from '../Models/messageModelSchema.js';
import Conversation from '../Models/conversationModelSchema.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://codezens.com",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // --- Chat rooms ---
    socket.on("join_chat", (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined chat room: ${conversationId}`);
    });

    socket.on("send_message", async (data) => {
      try {
        const { conversationId, senderId, receiverId, text, senderModel, receiverModel } = data;

        const newMessage = await Message.create({
          conversationId, senderId, senderModel, receiverId, receiverModel, text,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: { text, senderId, senderModel },
          $inc: { [`unreadCount.${receiverId}`]: 1 },
        });

        io.to(conversationId).emit("receive_message", newMessage);
      } catch (err) {
        console.error("Socket error:", err);
      }
    });

    // --- Notification rooms ---
    socket.on("join_notifications", ({ role, id }) => {
      if (role === "admin") {
        socket.join("admin_notifications");
        console.log(`Admin joined notification room`);
      } else if (role === "vendor" && id) {
        socket.join(`vendor_notifications_${id}`);
        console.log(`Vendor ${id} joined notification room`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Call this anywhere outside — controllers, services, etc.
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket first.");
  return io;
};