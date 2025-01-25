import express from "express";
import { addPayment } from "../controllers/payment.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { validateApi } from "../middlewares/validate";
import { paymentValidation } from "../validations/payment.validation";
const paymentRoutes = express.Router();

paymentRoutes.post(
  "/create-payment-intent",
  verifyUser,
  paymentValidation(),
  validateApi,
  addPayment
);

export default paymentRoutes;
