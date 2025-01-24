import express from "express";
import {
  addItemToCart,
  deleteItemFromCart,
  updateItemQuantity,
  getItemsFromCart,
} from "../controllers/cart.controller";
const cartRoutes = express.Router();
cartRoutes.post("/", getItemsFromCart);
cartRoutes.post("/add-item", addItemToCart);
cartRoutes.post("/remove-item", deleteItemFromCart);
cartRoutes.post("/update-item", updateItemQuantity);

export default cartRoutes;
