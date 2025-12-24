// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import Message from "./models/Message.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  "https://campus-kart-mern.vercel.app",
];


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // if you use cookies/auth headers
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
      cors: { origin: process.env.CLIENT_URL, credentials: true },
    });

    io.on("connection", (socket) => {
      // client: socket.emit("join", conversationId)
      socket.on("join", (conversationId) => {
        socket.join(`conv:${conversationId}`);
      });

      // client: socket.emit("sendMessage", { conversationId, text, senderId })
      socket.on("sendMessage", async ({ conversationId, text, senderId }) => {
        if (!conversationId || !text || !senderId) return;

        const msg = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text,
        });

        io.to(`conv:${conversationId}`).emit("newMessage", msg);
      });

      // optional: live status updates for orders/products
      socket.on("statusChanged", (payload) => {
        io.emit("statusChanged", payload); // all clients update cards
      });
    });

    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error("DB connection error", err));
