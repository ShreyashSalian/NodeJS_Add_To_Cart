import mongoose, { Document, Schema, Types } from "mongoose";

// Define TypeScript interface for the Payment document

interface IPayment extends Document {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  customer: Types.ObjectId;
}

// Define the schema
const paymentSchema = new Schema<IPayment>({
  paymentId: { type: String, required: true }, // Stripe Payment Intent ID
  amount: { type: Number, required: true }, // Payment amount in cents
  currency: { type: String, required: true }, // Currency (e.g., USD)
  status: { type: String, required: true }, // Payment status (e.g., succeeded, failed)
  createdAt: { type: Date, default: Date.now }, // Timestamp
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Create and export the model
const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
