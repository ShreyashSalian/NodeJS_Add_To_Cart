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
  items: [itemDocument];
  bill: number;
}

const itemSchema = new Schema<itemDocument>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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
    },
    price: {
      type: Number,
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
