import express from "express";
import { getMessages, getUnreadCount, markMessagesAsRead } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:senderId/:receiverId", getMessages);
router.get("/unread/:userId", getUnreadCount);
router.post("/mark-read", markMessagesAsRead);

export default router;
