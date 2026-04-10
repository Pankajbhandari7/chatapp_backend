import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("send_message", (data) => {
    io.to(data.receiverId).emit("receive_message", data);
    io.to(data.senderId).emit("receive_message", data);
  });
});

server.listen(5000, () => {
  console.log("Server running on 5000");
});