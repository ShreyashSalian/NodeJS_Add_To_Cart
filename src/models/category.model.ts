import mongoose, { Document, Schema, Types } from "mongoose";

export interface CategoryDocument extends Document {
  _id: string;
  category_name: string;
  category_description: string;
  category_slug: string;
  category_image: string;
  status: string;
  keywords: string[];
  is_featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CategoryStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

const categorySchema = new Schema<CategoryDocument>(
  {
    category_name: {
      type: String,
      required: true,
    },
    category_description: {
      type: String,
      required: true,
    },
    category_slug: {
      type: String,
      required: true,
    },
    category_image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CategoryStatus),
      default: CategoryStatus.ACTIVE,
    },
    keywords: [
      {
        type: String,
        required: true,
      },
    ],
    is_featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model<CategoryDocument>(
  "Category",
  categorySchema
);
