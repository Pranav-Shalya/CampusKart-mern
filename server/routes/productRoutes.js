import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  cancelListing,
} from "../controllers/productController.js";

const router = express.Router();

router.route("/").get(getProducts).post(protect, createProduct);
router.delete("/:id/cancel", protect, cancelListing);
router.get("/me", protect, getMyProducts);
router.route("/:id").get(getProductById);
export default router;
