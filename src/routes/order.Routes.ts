import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  placeOrder,
  getAllOrderOfCustomer,
} from "../controllers/order.controller";
import { orderValidation } from "../validations/order.validation";
import { validateApi } from "../middlewares/validate";

const orderRoutes = express.Router();
orderRoutes.post("/", verifyUser, orderValidation(), validateApi, placeOrder);
orderRoutes.post("/list-with-search", verifyUser, getAllOrderOfCustomer);

export default orderRoutes;
