import express from "express";
import { Cart, Item } from "../models/cart.models";
import {
  asyncHandler,
  AddItemToCartBody,
  ReturnResponseBody,
  DeleteItemFromCartBody,
  UpdateItemQuantityBody,
} from "../utils/fuction";
import { v4 as uuidv4 } from "uuid";
import { Product } from "../models/product.model";
import mongoose, { mongo } from "mongoose";

//POST => Used to add the product to the cart

export const addItemToCart = asyncHandler(
  async (
    req: express.Request<{}, {}, AddItemToCartBody>,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { productId, quantity, size, uniqueId } = req.body;

    // Validate request data
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid productId or quantity.",
        data: null,
        error: null,
      });
    }

    // Initialize variables
    let productPrice: number;
    let productName: string;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found.",
        data: null,
        error: null,
      });
    }

    // Determine product price based on size or default price
    if (size) {
      const sizeItem = product.productSize.find((item) => item.size === size);
      if (!sizeItem) {
        return res.status(400).json({
          status: 400,
          message: "Invalid size selected.",
          data: null,
          error: null,
        });
      }
      if (sizeItem.quantity < quantity) {
        return res.status(400).json({
          status: 400,
          message: "Insufficient stock.",
          data: null,
          error: null,
        });
      }
      sizeItem.quantity -= quantity;
      product.save();
      productName = product.productName;
      productPrice = sizeItem.price ?? 0;
    } else {
      // Check stock availability
      if (
        product.productQuantity === undefined ||
        product.productQuantity < quantity
      ) {
        return res.status(400).json({
          status: 400,
          message: "Insufficient stock.",
          data: null,
          error: null,
        });
      }
      productName = product.productName;
      productPrice = product.defaultPrice ?? 0;
      product.productQuantity -= quantity;
      product.save();
    }

    // Find the cart for the user by uniqueId
    const cart = await Cart.findOne({ uniqueId });

    if (cart) {
      // Check if the product already exists in the cart
      const cartIndex = cart.items.findIndex(
        (item) =>
          item.productId.equals(new mongoose.Types.ObjectId(productId)) &&
          item.size === size
      );

      if (cartIndex > -1) {
        // Update existing product in the cart
        const existingProduct = cart.items[cartIndex];
        existingProduct.quantity += quantity;
        existingProduct.price += productPrice * quantity;
        existingProduct.actualPrice = productPrice;
        cart.bill += productPrice * quantity;

        // Save updated cart
        cart.items[cartIndex] = existingProduct;
        await cart.save();

        return res.status(200).json({
          status: 200,
          message: "Cart updated successfully.",
          data: cart,
          error: null,
        });
      } else {
        const newItem = new Item({
          productId,
          size: size || "", // Default empty string if no size
          productName,
          quantity,
          actualPrice: productPrice,
          price: productPrice * quantity,
        });

        cart.items.push(newItem);
        cart.bill += quantity * productPrice;

        await cart.save();
        return res.status(200).json({
          status: 200,
          message: "Item added to cart successfully.",
          data: cart,
          error: null,
        });
      }
    } else {
      const newUniqueId = uuidv4();
      // Create a new cart for the user
      const newCart = await Cart.create({
        uniqueId: newUniqueId,
        items: [
          {
            productId,
            productName,
            size: size || "",
            quantity,
            actualPrice: productPrice,
            price: productPrice * quantity,
          },
        ],
        bill: productPrice * quantity,
      });

      return res.status(200).json({
        status: 200,
        message: "New cart created and item added successfully.",
        data: newCart,
        error: null,
      });
    }
  }
);

//POST => Used to delete the item from the cart
export const deleteItemFromCart = asyncHandler(
  async (
    req: express.Request<{}, {}, DeleteItemFromCartBody>,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { productId, uniqueId } = req.body;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "No product found",
      });
    }

    // Find the cart by uniqueId
    const cart = await Cart.findOne({ uniqueId: uniqueId });
    if (cart) {
      // Find the index of the product in the cart
      const cartIndex = cart.items.findIndex((item) => {
        return item.productId.equals(new mongoose.Types.ObjectId(productId));
      });

      // If the product is found in the cart
      if (cartIndex > -1) {
        let productItem = cart.items[cartIndex];

        // Update the cart bill
        cart.bill -= productItem.quantity * productItem.actualPrice;
        if (cart.bill < 0) {
          cart.bill = 0;
        }

        // Remove the item from the cart
        cart.items.splice(cartIndex, 1);

        // Update stock for the product
        if (productItem.size) {
          const sizeItem = product.productSize.find(
            (item) => item.size === productItem.size
          );
          if (sizeItem) {
            sizeItem.quantity += productItem.quantity;
          }
        } else if (product.productQuantity !== undefined) {
          product.productQuantity += productItem.quantity;
        }

        // Save the updated product and cart
        await product.save();
        await cart.save();

        // Return success response
        return res.status(200).json({
          status: 200,
          message: "Item deleted from the cart",
          data: cart,
          error: null,
        });
      } else {
        // If the product is not found in the cart
        return res.status(404).json({
          status: 404,
          message: "Product not found in the cart",
          data: null,
          error: null,
        });
      }
    } else {
      // If the cart is not found
      return res.status(404).json({
        status: 404,
        message: "The cart is empty",
        data: null,
        error: null,
      });
    }
  }
);

//POST => Used to update the quantity of the product from the cart.
export const updateItemQuantity = asyncHandler(
  async (
    req: express.Request<{}, {}, UpdateItemQuantityBody>,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { productId, quantity, uniqueId } = req.body;
    //Find the product by productID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
        data: null,
        error: null,
      });
    }
    //Find the user cart
    const cart = await Cart.findOne({ uniqueId: uniqueId });
    if (!cart) {
      return res.status(404).json({
        status: 404,
        message: "Cart is empty",
        data: null,
        error: null,
      });
    }
    //Find the index of the product in the cart's items array
    const cartIndex = cart.items.findIndex((item) => {
      return item.productId.equals(new mongoose.Types.ObjectId(productId));
    });
    if (cartIndex > -1) {
      let productItem = cart.items[cartIndex];
      //Calculate the total price for the current quantity and redcue it from the bill
      const previousTotal = productItem.quantity * productItem.actualPrice;
      cart.bill -= previousTotal;
      productItem.quantity = quantity;
      if (product.productQuantity) {
        if (product.productQuantity < quantity) {
          return res.status(400).json({
            status: 400,
            message: "Insufficient stock for the selected size.",
            data: null,
            error: null,
          });
        }
        product.productQuantity += productItem.quantity;
        product.productQuantity -= quantity;
      }
      if (product.productSize) {
        product.productSize.find((item) => {
          if (item.quantity < quantity) {
            return res.status(400).json({
              status: 400,
              message: "Insufficient stock.",
              data: null,
              error: null,
            });
          }
          item.quantity += productItem.quantity;
          item.quantity -= quantity;
        });
      }
      product.save();
      //Update the productQuantity and price in the cart
      if (productItem.quantity <= 0) {
        cart.items.splice(cartIndex, 1);
      } else {
        const size = productItem?.size;
        if (size) {
          const sizeItem = product.productSize.find(
            (item) => item.size === size
          );
          if (sizeItem?.price !== undefined) {
            productItem.actualPrice = sizeItem?.price;
            productItem.price = quantity * sizeItem.price;
          }
        } else {
          if (product.defaultPrice !== undefined) {
            productItem.actualPrice = product.defaultPrice;
            productItem.price = quantity * product.defaultPrice;
          }
        }
        //Add the new total price to the bill
        cart.bill += productItem.price;
        cart.items[cartIndex] = productItem;
      }
      await cart.save();
      return res.status(200).json({
        status: 200,
        message: "Cart updated successfully",
        data: cart,
        error: null,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Product not found in the cart",
        data: null,
        error: null,
      });
    }
  }
);

//POST => Used to get the items from the cart of the given users
export const getItemsFromCart = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { uniqueId }: { uniqueId: string } = req.body;
    const cart = await Cart.findOne({ uniqueId: uniqueId });
    if (cart && cart.items.length > 0) {
      const responsePayload = {
        status: 200,
        message: "The cart details.",
        data: cart,
        error: null,
      };
      return res.status(200).json(responsePayload);
    } else {
      const responsePayload = {
        status: 200,
        message: "The cart is empty",
        data: null,
        error: null,
      };
      return res.status(500).json(responsePayload);
    }
  }
);
