import mongoose, { Document, Schema, Types } from "mongoose";

export interface CategoryDocument extends Document {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  categorySlug: string;
  categoryImage: string;
  status: string;
  keywords: string[];
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CategoryStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

const categorySchema = new Schema<CategoryDocument>(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categoryDescription: {
      type: String,
      required: true,
    },
    categorySlug: {
      type: String,
      required: true,
    },
    categoryImage: {
      type: String,
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
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
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
