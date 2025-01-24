import mongoose, { Document, Schema, Types } from "mongoose";

export interface itemDocument extends Document {
  _id: string;
  productId: Types.ObjectId;
  size: string;
  productName: string;
  quantity: number;
  actualPrice: number;
  price: number;
}

export interface CartDocument extends Document {
  _id: string;
  uniqueId: string;
  items: itemDocument[]; /// Updated to allow an empty array or multiple items
  bill: number;
}

const itemSchema = new Schema<itemDocument>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productName: {
      type: String,
    },
    size: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = new Schema<CartDocument>({
  uniqueId: {
    type: String,
    required: true,
  },
  items: [itemSchema],
  bill: {
    type: Number,
  },
});

export const Cart = mongoose.model<CartDocument>("Cart", cartSchema);
export const Item = mongoose.model<itemDocument>("ITem", itemSchema);
