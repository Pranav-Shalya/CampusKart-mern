import express from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.post("/:id/read", protect, markNotificationRead);
router.post("/read-all", protect, markAllRead);

export default router;
