import mongoose, { Document, Schema, Types } from "mongoose";

//Define the interface for size
export interface Size {
  _id: string;
  size: string;
  price: number;
  description?: string;
  quantity: number;
}
//Define the interface for the product document
export interface ProductDocument extends Document {
  _id: string;
  product_name: string;
  product_description: string;
  product_quantity?: number; // Only required if product size is empty
  product_size: Size[];
  product_images: String[];
  default_price?: number; //Only required if product size is empty
  product_category: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

//Define the schema for the size
const sizeSchema = new Schema<Size>({
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

//Define the schema for the product

const productSchema = new Schema<ProductDocument>(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: function (this: ProductDocument) {
        return this.product_size.length === 0; // Required if `product_size` is empty
      },
    },
    product_size: [sizeSchema],
    default_price: {
      type: Number,
      required: function (this: ProductDocument) {
        return this.product_size.length === 0; // Required if `product_size` is empty
      },
    },
    product_images: [
      {
        type: String,
        required: true,
      },
    ],
    product_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

export const Product = mongoose.model<ProductDocument>(
  "Product",
  productSchema
);
