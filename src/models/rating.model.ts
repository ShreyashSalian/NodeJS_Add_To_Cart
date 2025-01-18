import mongoose, { Document, Schema, Types } from "mongoose";
import { Type } from "typescript";

export interface RatingDocument extends Document {
  _id: string;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ratingSchema = new Schema<RatingDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, //Assuming the rating between 1 and 5
    },
  },

  {
    timestamps: true,
  }
);

export const Rating = mongoose.model<RatingDocument>("Rating", ratingSchema);
