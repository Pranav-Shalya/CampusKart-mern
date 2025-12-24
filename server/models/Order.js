import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false
    },
    customItem: {
        type:String,
        required: false
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    runner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }, // delivery person
    status: {
      type: String,
       enum: [
          "OPEN",
          "ASSIGNED",
          "PICKUP_REQUESTED",   // runner asked seller
          "PICKED_FROM_SELLER", // seller handed parcel to runner
          "DELIVERED_TO_BUYER", // runner says given to buyer
          "SELLER_DELIVERED",
          "RUNNER_GOING",      // NEW
          "RUNNER_TAKEN",      
          "COMPLETED",
          "CANCELLED",
        ],
      default: "OPEN"
    },
    pickupMode: {
      type: String,
      enum: ["SELF", "DELIVERY"],
      default: "SELF",
    },
     image: { type: String },

    pickupLocation: String,     // e.g. khokha / hostel
    dropLocation: String,       // buyer hostel
    deliveryFee: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
