import mongoose, { Document, Schema, Types } from "mongoose";

export interface OrderItem {
  productId: Types.ObjectId;
  productName: string;
  size: string;
  quantity: number;
  price: number;
}

export interface OrderDocument extends Document {
  orderId: string;
  userId: Types.ObjectId; // The user need to login
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Types.ObjectId;
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new Schema<OrderDocument>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      type: mongoose.Schema.ObjectId,
      ref: "CustomerAddress",
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<OrderDocument>("Order", OrderSchema);
