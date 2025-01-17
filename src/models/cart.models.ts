import mongoose, { Document, Schema, Types } from "mongoose";

export interface itemDocument extends Document {
  _id: string;
  productId: Types.ObjectId;
  size: string;
  product_name: string;
  quantity: number;
  actual_price: number;
  price: number;
}

export interface CartDocument extends Document {
  _id: string;
  unique_id: string;
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
    actual_price: {
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
  unique_id: {
    type: String,
    required: true,
  },
  items: [itemSchema],
  bill: {
    type: Number,
  },
});

export const Cart = mongoose.model<CartDocument>("Cart", cartSchema);
