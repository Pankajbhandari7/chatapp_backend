import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import Message from "./models/Message.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
db();

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (data) => {
    if (typeof data === "string") {
      socket.join(data);
    } else {
      socket.join(data.userId);
      if (data.roomIds) {
        data.roomIds.forEach(id => socket.join(id));
      }
    }
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message({
        senderId: data.senderId,
        receiverId: data.receiverId || "",
        roomId: data.roomId,
        message: data.message,
      });
      const savedMsg = await newMessage.save();

      if (data.roomId) {
        io.to(data.roomId).emit("receive_message", savedMsg);
      } else {
        io.to(data.receiverId).emit("receive_message", savedMsg);
        io.to(data.senderId).emit("receive_message", savedMsg);
      }
    } catch (error) {
      console.log("Error saving message", error);
    }
  });

  socket.on("delete_message", async (data) => {
    try {
      await Message.findByIdAndDelete(data.messageId);
      io.to(data.receiverId).emit("message_deleted", data.messageId);
      io.to(data.senderId).emit("message_deleted", data.messageId);
    } catch (error) {
      console.log("Error deleting message", error);
    }
  });

  socket.on("update_message", async (data) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        data.messageId, 
        { message: data.newMessageContent }, 
        { new: true }
      );
      if (updated) {
        io.to(data.receiverId).emit("message_updated", updated);
        io.to(data.senderId).emit("message_updated", updated);
      }
    } catch (error) {
      console.log("Error updating message", error);
    }
  });

  socket.on("clear_chat", async (data) => {
    try {
      await Message.deleteMany({
        $or: [
          { senderId: data.senderId, receiverId: data.receiverId },
          { senderId: data.receiverId, receiverId: data.senderId }
        ]
      });
      io.to(data.receiverId).emit("chat_cleared");
      io.to(data.senderId).emit("chat_cleared");
    } catch (error) {
      console.log("Error clearing chat", error);
    }
  });

  // WebRTC Signaling
  socket.on("call_user", (data) => {
    io.to(data.receiverId).emit("incoming_call", { 
      signal: data.signalData, 
      senderId: data.senderId, 
      isVideo: data.isVideo 
    });
  });

  socket.on("answer_call", (data) => {
    io.to(data.senderId).emit("call_accepted", data.signalData);
  });

  socket.on("ice_candidate", (data) => {
    io.to(data.receiverId).emit("res_ice_candidate", { 
      candidate: data.candidate, 
      senderId: data.senderId 
    });
  });

  socket.on("end_call", (data) => {
    io.to(data.receiverId).emit("call_ended");
    io.to(data.senderId).emit("call_ended");
  });

  socket.on("typing", (data) => {
    io.to(data.receiverId).emit("typing", data.senderId);
  });

  socket.on("stop_typing", (data) => {
    io.to(data.receiverId).emit("stop_typing", data.senderId);
  });

  socket.on("group_updated", (data) => {
    // Notify the newly added user
    io.to(data.addedUserId).emit("added_to_group", data.room);
    
    // Notify the room members that the room has been updated (e.g. member count, list)
    io.to(data.room._id).emit("room_updated", data.room);
  });
});

server.listen(5000, () => {
  console.log("Server running on 5000");
});