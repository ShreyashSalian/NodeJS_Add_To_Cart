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
  productName: string;
  productDescription: string;
  productQuantity?: number; // Only required if product size is empty
  productSize: Size[];
  productImages: String[];
  defaultPrice?: number; //Only required if product size is empty
  productCategory: Types.ObjectId;
  averageRating: number;
  totalRating: number;
  isDeleted: Boolean;
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
    productName: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    productQuantity: {
      type: Number,
      required: function (this: ProductDocument) {
        return this.productSize.length === 0; // Required if `product_size` is empty
      },
    },
    productSize: [sizeSchema],
    defaultPrice: {
      type: Number,
      required: function (this: ProductDocument) {
        return this.productSize.length === 0; // Required if `product_size` is empty
      },
    },
    productImages: [
      {
        type: String,
        required: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
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
