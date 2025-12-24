// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Books", "Electronics", "Stationery", "Furniture", "Others"],
      required: true,
    },
    images: [String],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isSold: { type: Boolean, default: false },
    college: String,
    hostel: String,
    status: {
      type: String,
      enum: ["OPEN", "ASSIGNED", "DELIVERED"],
      default: "OPEN",
    },
    assignedRunner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
