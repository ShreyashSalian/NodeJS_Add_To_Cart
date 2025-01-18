import mongoose, { Document, Schema, Types } from "mongoose";

export interface CustomAddressDocument extends Document {
  _id: string;
  user: Types.ObjectId;
  addressLine1: string;
  addressLine2?: string;
  landMark?: string;
  specialInstruction?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
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
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    specialInstruction: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
    addressType: {
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
