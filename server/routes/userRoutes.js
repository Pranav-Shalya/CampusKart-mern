import express from "express";
import { protect } from "../middleware/auth.js";
import { toggleWishlist, getWishlist } from "../controllers/userController.js";

const router = express.Router();

router.post("/wishlist", protect, toggleWishlist);
router.get("/wishlist", protect, getWishlist);

export default router;
