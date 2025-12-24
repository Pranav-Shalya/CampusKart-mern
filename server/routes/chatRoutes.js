import express from "express";
import { protect } from "../middleware/auth.js";
import {
  startConversation,
  sendMessage,
  getMessages
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/conversation", protect, startConversation);
router.post("/message", protect, sendMessage);
router.get("/messages/:id", protect, getMessages);

export default router;
