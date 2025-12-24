import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createNotification } from "../utils/createNotification.js";
export const createOrder = async (req, res) => {
  try {
    const {
      productId,
      customItem,
      pickupLocation,
      dropLocation,
      deliveryFee,
      pickupMode,
      image,
    } = req.body;

    if (!productId && !customItem) {
      return res
        .status(400)
        .json({ message: "Either productId or customItem is required" });
    }

    let sellerId = null;
    let product = null;

    if (productId) {
  product = await Product.findById(productId).populate("seller", "_id");
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // NEW: prevent seller from buying own listing
  if (product.seller._id.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json({ message: "You cannot place an order on your own listing." });
  }
      // block if this product already has an active order
      const existing = await Order.findOne({
        product: productId,
        status: { $in: ["OPEN", "ASSIGNED"] },
      });
      if (existing) {
        return res
          .status(400)
          .json({ message: "This item already has an active order" });
      }

      sellerId = product.seller._id;

      // reserve the item: move out of "items for sale"
      product.status = "ASSIGNED";
      await product.save();
    }

    const order = await Order.create({
      product: product ? product._id : undefined,
      customItem: customItem || undefined,
      buyer: req.user._id,
      seller: sellerId || undefined,
      pickupLocation,
      dropLocation,
      deliveryFee,
      pickupMode: pickupMode || "SELF", // default self‑pickup
      image: image || undefined,
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error("createOrder error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error creating order" });
  }
};

export const myBuyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title price category images")
      .sort("-createdAt");
    return res.json(orders);
  } catch (err) {
    console.error("myBuyOrders error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error fetching buy orders" });
  }
};

export const mySellOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate("product", "title price category images")
      .sort("-createdAt");
    return res.json(orders);
  } catch (err) {
    console.error("mySellOrders error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error fetching sell orders" });
  }
};

export const openOrders = async (req, res) => {
  try {
    // only orders that still need a delivery person
    const orders = await Order.find({
      //  status: { $in: ["OPEN", "ASSIGNED"] },
      status: {
    $in: [
      "OPEN",
      // "ASSIGNED",
      // "PICKUP_REQUESTED",
      // "PICKED_FROM_SELLER",
      // "DELIVERED_TO_BUYER",
    ],
  },           // only OPEN now
      pickupMode: "DELIVERY",
      
    })
      .populate("product", "title price category images")
      .populate("buyer", "name hostel")
      // .populate("runner", "_id");   // so o.runner._id works in frontend
      return res.json(orders);
  } catch (err) {
    console.error("openOrders error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error fetching open orders" });
  }
};

export const claimOrder = async (req, res) => {
  try {
    const { id } = req.params; // order id
    const order = await Order.findById(id);
    if (!order || order.status !== "OPEN") {
      return res.status(400).json({ message: "Order not available" });
    }

    order.runner = req.user._id;
    // NEW: separate flow if this is a custom buy request (no seller)
      if (!order.product && !order.seller) {
        order.status = "RUNNER_GOING";         // new status
      } else {
        order.status = "ASSIGNED";             // existing flow for items for sale
      }

      await order.save();

      // Notify buyer that a runner accepted
      await createNotification({
        userId: order.buyer,
        title: "Delivery accepted",
        message: "A delivery partner has accepted your order.",
        orderId: order._id,
        type: "RUNNER_ASSIGNED",
      });
      return res.json(order);
  } catch (err) {
    console.error("claimOrder error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error claiming order" });
  }
};

export const myDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ runner: req.user._id })
      .populate("product", "title price images")
      .populate("buyer", "name hostel")
      .populate("runner", "_id")
      .sort("-createdAt");
    return res.json(orders);
  } catch (err) {
    console.error("myDeliveries error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error fetching deliveries" });
  }
};



export const markOrderCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      !order.buyer.equals(req.user._id) &&
      !order.runner?.equals(req.user._id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // self pickup: require SELLER_DELIVERED
    if (order.pickupMode === "SELF" && order.status !== "SELLER_DELIVERED") {
      return res
        .status(400)
        .json({ message: "Seller must mark delivered before you receive it" });
    }

    // delivery: require DELIVERED_TO_BUYER
    if (
      order.pickupMode === "DELIVERY" &&
      order.status !== "DELIVERED_TO_BUYER"
    ) {
      return res
        .status(400)
        .json({ message: "Delivery person must mark delivered first" });
    }

    order.status = "COMPLETED";
    await order.save();

    if (order.product) {
      await Product.findByIdAndUpdate(order.product, {
        isSold: true,
        status: "DELIVERED",
      });
    }

    // notify runner and seller (if present)
    if (order.runner) {
      await createNotification({
        userId: order.runner,
        title: "Order completed",
        message: "The buyer has confirmed delivery. Thank you for delivering!",
        orderId: order._id,
      });
    }

    if (order.seller) {
      await createNotification({
        userId: order.seller,
        title: "Order completed",
        message: "The buyer has confirmed receiving your item.",
        orderId: order._id,
      });
    }

    return res.json(order);
  } catch (err) {
    console.error("markOrderCompleted error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error marking completed" });
  }
};


// export const markOrderCompleted = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     if (
//       !order.buyer.equals(req.user._id) &&
//       !order.runner?.equals(req.user._id)
//     ) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     // self pickup: require SELLER_DELIVERED
//     if (order.pickupMode === "SELF" && order.status !== "SELLER_DELIVERED") {
//       return res
//         .status(400)
//         .json({ message: "Seller must mark delivered before you receive it" });
//     }

//     // delivery: require DELIVERED_TO_BUYER
//     if (
//       order.pickupMode === "DELIVERY" &&
//       order.status !== "DELIVERED_TO_BUYER"
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Delivery person must mark delivered first" });
//     }

//     order.status = "COMPLETED";
//     await order.save();

//     if (order.product) {
//       await Product.findByIdAndUpdate(order.product, {
//         isSold: true,
//         status: "DELIVERED",
//       });
//     }

//     return res.json(order);
//   } catch (err) {
//     console.error("markOrderCompleted error:", err);
//     return res
//       .status(500)
//       .json({ message: err.message || "Server error marking completed" });
//   }
// };


// cancel order: restore product if any, then delete order
// cancel order: restore product if any, then delete order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // only buyer can cancel
    if (!order.buyer.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // If this was a product from Items for sale, put product back on Home
    if (order.product) {
      await Product.findByIdAndUpdate(order.product, {
        status: "OPEN",
        isSold: false,
      });
    }

    // notify runner and seller that buyer cancelled
    if (order.runner) {
      await createNotification({
        userId: order.runner,
        title: "Order cancelled",
        message: "The buyer has cancelled this order.",
        orderId: order._id,
      });
    }

    if (order.seller) {
      await createNotification({
        userId: order.seller,
        title: "Order cancelled",
        message: "The buyer has cancelled their order for your item.",
        orderId: order._id,
      });
    }

    // Remove the order document so it disappears everywhere
    await order.deleteOne();

    return res.json({ message: "Order cancelled" });
  } catch (err) {
    console.error("cancelOrder error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error cancelling order" });
  }
};

// export const cancelOrder = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // only buyer can cancel
//     if (!order.buyer.equals(req.user._id)) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     // If this was a product from Items for sale, put product back on Home
//     if (order.product) {
//       await Product.findByIdAndUpdate(order.product, {
//         status: "OPEN",
//         isSold: false,
//       });
//     }

//     // Remove the order document so it disappears everywhere
//     await order.deleteOne();

//     return res.json({ message: "Order cancelled" });
//   } catch (err) {
//     console.error("cancelOrder error:", err);
//     return res
//       .status(500)
//       .json({ message: err.message || "Server error cancelling order" });
//   }
// };

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("product", "title price category images")
      .populate("buyer", "name hostel")
      .populate("seller", "name hostel")
      .populate("runner", "name hostel");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("getOrderById error:", err);
    res
      .status(500)
      .json({ message: err.message || "Server error fetching order" });
  }
};

export const unassignRunner = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // only current runner can unassign
    if (!order.runner || !order.runner.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // remember previous runner (optional, if needed later)
    const prevRunnerId = order.runner;

    // put it back to open, remove runner
    order.runner = undefined;
    order.status = "OPEN";
    await order.save();

    // notify buyer (and seller if exists) that runner left
    await createNotification({
      userId: order.buyer,
      title: "Runner cancelled delivery",
      message:
        "Your previous delivery partner left the order. It is open again for others.",
      orderId: order._id,
    });

    if (order.seller) {
      await createNotification({
        userId: order.seller,
        title: "Runner cancelled delivery",
        message:
          "The delivery partner left this order. It may be reassigned to someone else.",
        orderId: order._id,
      });
    }

    // (optional) notify the runner themselves
    if (prevRunnerId) {
      await createNotification({
        userId: prevRunnerId,
        title: "You left an order",
        message: "You have unassigned yourself from a delivery.",
        orderId: order._id,
      });
    }

    res.json(order);
  } catch (err) {
    console.error("unassignRunner error:", err);
    res
      .status(500)
      .json({ message: err.message || "Server error updating order" });
  }
};

// export const unassignRunner = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id);

//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // only current runner can unassign
//     if (!order.runner || !order.runner.equals(req.user._id)) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     // put it back to open, remove runner
//     order.runner = undefined;
//     order.status = "OPEN";
//     await order.save();

//     res.json(order);
//   } catch (err) {
//     console.error("unassignRunner error:", err);
//     res
//       .status(500)
//       .json({ message: err.message || "Server error updating order" });
//   }
// };


// // controllers/orderController.js
// export const cancelAndDeleteOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // only buyer can cancel their buy request
//     if (!order.buyer.equals(req.user._id)) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     await order.deleteOne();              // removes from DB
//     return res.json({ message: "Order deleted" });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: err.message || "Error deleting order" });
//   }
// };


export const markSellerDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // only seller, only self pickup
    if (!order.seller?.equals(req.user._id) || order.pickupMode !== "SELF") {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (order.status !== "OPEN" && order.status !== "ASSIGNED") {
      return res
        .status(400)
        .json({ message: "Order is not in a deliverable state" });
    }

    order.status = "SELLER_DELIVERED";
    await order.save();

    await createNotification({
      userId: order.buyer,
      title: "Item ready for pickup",
      message:
        "The seller has marked your order as ready. Meet them and tap “Mark as received”.",
      orderId: order._id,
    });


    return res.json(order);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Error marking delivered" });
  }
};


// runner: after accepting, asks seller for parcel
export const runnerRequestPickup = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.runner?.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (order.pickupMode !== "DELIVERY" || order.status !== "ASSIGNED") {
      return res
        .status(400)
        .json({ message: "Order not in a pickup-requestable state" });
    }

    order.status = "PICKUP_REQUESTED";
    await order.save();
    await createNotification({
      userId: order.seller,
      title: "Parcel pickup requested",
      message: "A delivery partner is coming to pick up the parcel for an order.",
      orderId: order._id,
      type: "PICKUP_REQUESTED",
    });
    return res.json(order);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Error requesting pickup" });
  }
};

// seller: confirms parcel given to runner
export const sellerGivenToRunner = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.seller?.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (order.pickupMode !== "DELIVERY" || order.status !== "PICKUP_REQUESTED") {
      return res
        .status(400)
        .json({ message: "Order not in a give-to-runner state" });
    }

    order.status = "PICKED_FROM_SELLER";
    await order.save();
    await createNotification({
      userId: order.buyer,
      title: "Parcel picked from seller",
      message: "Your parcel is with the delivery partner and is on the way.",
      orderId: order._id,
    });

    return res.json(order);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Error marking given to runner" });
  }
};

// runner: confirms delivered to buyer
export const runnerDeliveredToBuyer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.runner?.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (
      order.pickupMode !== "DELIVERY" ||
      (order.product && order.status !== "PICKED_FROM_SELLER") ||
      (!order.product && order.status !== "RUNNER_TAKEN")
    ) {
      return res
        .status(400)
        .json({ message: "Order not in a deliverable-to-buyer state" });
    }


    order.status = "DELIVERED_TO_BUYER";
    await order.save();
    await createNotification({
      userId: order.buyer,
      title: "Order delivered",
      message: "Your order has been delivered. Please confirm you received it.",
      orderId: order._id,
    });
    return res.json(order);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Error marking delivered to buyer" });
  }
};


// NEW: runner marks picked up (custom request only)
// NEW: runner marks picked up (custom request only)
export const runnerPickedCustom = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.runner?.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // only for custom orders (from BuyPage)
    if (order.product || order.seller) {
      return res
        .status(400)
        .json({ message: "This pickup flow is only for custom requests" });
    }

    if (order.status !== "RUNNER_GOING") {
      return res
        .status(400)
        .json({ message: "Order not in a pickup state" });
    }

    order.status = "RUNNER_TAKEN";
    await order.save();
    await createNotification({
      userId: order.buyer,
      title: "Parcel picked up",
      message: "Your delivery partner has picked up the parcel.",
      orderId: order._id,
    });
    return res.json(order);
  } catch (err) {
    console.error("runnerPickedCustom error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Error marking picked up" });
  }
};

