import express from "express";
import { validateApi } from "../middlewares/validate";
import { verifyUser } from "../middlewares/auth.middleware";
import { customerAddressValidation } from "../validations/customerAddress.validation";
import {
  addCustomerAddress,
  getCustomerAddress,
  updateAddress,
} from "../controllers/customerAddress";

const customerAddressRoutes = express.Router();
customerAddressRoutes.post(
  "/",
  verifyUser,
  customerAddressValidation(),
  validateApi,
  addCustomerAddress
);

customerAddressRoutes.put(
  "/",
  verifyUser,
  customerAddressValidation(),
  validateApi,
  updateAddress
);
customerAddressRoutes.get("/", verifyUser, getCustomerAddress);

export default customerAddressRoutes;
