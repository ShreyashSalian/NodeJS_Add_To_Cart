import express from "express";
import { AdminUser, verifyUser } from "../middlewares/auth.middleware";
import {
  placeOrder,
  getAllOrderOfCustomer,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/order.controller";
import { orderValidation } from "../validations/order.validation";
import { validateApi } from "../middlewares/validate";

const orderRoutes = express.Router();
orderRoutes.post("/", verifyUser, orderValidation(), validateApi, placeOrder);
orderRoutes.post("/list-with-search", verifyUser, getAllOrderOfCustomer);
orderRoutes.post(
  "/update-order-status",
  verifyUser,
  AdminUser,
  updateOrderStatus
);
orderRoutes.post(
  "/update-payment-status",
  verifyUser,
  AdminUser,
  updatePaymentStatus
);

export default orderRoutes;
