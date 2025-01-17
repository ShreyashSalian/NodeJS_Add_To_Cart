import mongoose, { Document, Schema, Types } from "mongoose";

export interface CustomAddressDocument extends Document {
  _id: string;
  user: Types.ObjectId;
  address_line_1: string;
  address_line_2?: string;
  landMark?: string;
  special_instruction?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum AddressType {
  HOME = "home",
  OFFICE = "office",
}

const customAddressSchema = new Schema<CustomAddressDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    address_line_1: {
      type: String,
    },
    address_line_2: {
      type: String,
    },
    special_instruction: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    country: {
      type: String,
    },
    address_type: {
      type: String,
      required: true,
      enum: Object.values(AddressType),
      default: AddressType.HOME,
    },
  },
  {
    timestamps: true,
  }
);

export const CustomAddress = mongoose.model<CustomAddressDocument>(
  "CustomerAddress",
  customAddressSchema
);
