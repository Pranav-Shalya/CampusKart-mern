import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: [
        "ORDER_STATUS",
        "NEW_REQUEST",
        "RUNNER_ASSIGNED",
        "PICKUP_REQUESTED",
      ],
      default: "ORDER_STATUS",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
