import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createOrder,
  myBuyOrders,
  mySellOrders,
  openOrders,
  claimOrder,
  myDeliveries,
  markOrderCompleted,
  getOrderById,
  cancelOrder,
  unassignRunner,
  // cancelAndDeleteOrder,
  markSellerDelivered,
  runnerRequestPickup,
  sellerGivenToRunner,
  runnerDeliveredToBuyer,
  runnerPickedCustom,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);           // buyer places order
router.get("/buy", protect, myBuyOrders);         // my buy orders
router.get("/sell", protect, mySellOrders);       // orders for my listings
router.get("/open", protect, openOrders);         // available to deliver
router.post("/:id/claim", protect, claimOrder);   // take a delivery
router.get("/deliver", protect, myDeliveries);    // my deliveries

router.post("/:id/complete", protect, markOrderCompleted);
router.delete("/:id/cancel", protect, cancelOrder);
router.get("/:id", protect, getOrderById);
router.post("/:id/unassign", protect, unassignRunner);
// router.delete("/:id/cancel", protect, cancelAndDeleteOrder);
router.post("/:id/seller-delivered", protect, markSellerDelivered);
router.post("/:id/runner-request-pickup", protect, runnerRequestPickup);
router.post("/:id/seller-given", protect, sellerGivenToRunner);
router.post("/:id/runner-delivered", protect, runnerDeliveredToBuyer);
router.post("/:id/runner-picked-custom", protect, runnerPickedCustom);
export default router;
