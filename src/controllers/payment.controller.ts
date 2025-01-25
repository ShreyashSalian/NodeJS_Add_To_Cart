import express from "express";
import { asyncHandler } from "../utils/fuction";
import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from "../models/payment.model";
dotenv.config();

//POST => Used to add the payment

export const addPayment = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const stripeSecret = process.env.STRIPE_SECRET;
    if (!stripeSecret) {
      return res.status(500).json({
        message: "Stripe secret key is missing.",
        error: "Internal server error.",
        data: null,
        status: 500,
      });
    }

    const stripe = new Stripe(stripeSecret);

    const { amount, currency } = req.body;

    //Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ["card"],
    });

    console.log(
      paymentIntent.status,
      "---------------------------------------------status"
    );

    // Handling status of the payment intent
    if (paymentIntent.status === "requires_payment_method") {
      return res.status(400).json({
        message: "Payment requires a payment method.",
        error: "Payment method is missing or not valid.",
        data: { clientSecret: paymentIntent.client_secret },
        status: 400,
      });
    }

    // If the payment was successful, save to the database (uncomment the below lines if needed)
    if (paymentIntent.status === "succeeded") {
      const paymentData = await Payment.create({
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        customer: req.user?.userId, // Assuming the user is authenticated
      });
      console.log("Payment data saved successfully.");
      res.status(200).json({
        message: "Payment made successfully.",
        error: null,
        data: { clientSecret: paymentIntent.client_secret },
        status: 200,
      });
    } else {
      res.status(500).json({
        message: null,
        error: "Payment failed or requires additional actions.",
        data: null,
        status: 500,
      });
    }
  }
);
