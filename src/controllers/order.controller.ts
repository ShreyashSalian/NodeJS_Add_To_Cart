import express from "express";
import { v4 as uuidv4 } from "uuid";
import {
  asyncHandler,
  buildSearchPaginationSortingPipeline,
} from "../utils/fuction";
import { Cart } from "../models/cart.models";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";
import { CustomAddress } from "../models/customerAddress.model";
import mongoose from "mongoose";
import Redis from "ioredis";

//POST => Used to add the order
export const placeOrder = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { uniqueId } = req.body;
    if (!req.user?.userId) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized user.",
        data: null,
        error: "User not logged in.",
      });
    }
    //Find the address of the customer
    const customerAddress = await CustomAddress.findOne({
      user: req.user?.userId,
    });
    if (!customerAddress) {
      return res.status(400).json({
        status: 400,
        message: "Please fill the Address.",
        data: null,
        error: null,
      });
    }
    // Find the user's cart
    const cart = await Cart.findOne({ uniqueId });
    if (!cart) {
      return res.status(400).json({
        status: 400,
        message: "Cart is empty.",
        data: null,
        error: null,
      });
    }

    //Generate a unique order ID
    const orderId = uuidv4();
    //Create the order
    const order = await Order.create({
      orderId,
      userId: req.user?.userId,
      items: cart.items,
      totalAmount: cart.bill,
      paymentStatus: "pending", // Update after payment integration
      orderStatus: "pending",
      shippingAddress: customerAddress?._id,
    });

    //Deduct stock for each product
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        if (item.size) {
          const sizeItem = product.productSize.find(
            (s) => s.size === item.size
          );
          if (sizeItem) {
            sizeItem.quantity -= item.quantity;
          }
        } else if (product.productQuantity !== undefined) {
          product.productQuantity -= item.quantity;
        }
        await product.save();
      }
    }
    //Clear the cart;
    cart.items = [];
    cart.bill = 0;
    await cart.save();
    // Send response
    return res.status(200).json({
      status: 200,
      message: "Order placed successfully.",
      data: order,
      error: null,
    });
  }
);

//POST => Used to get the order Detail =
export const getAllOrderOfCustomer = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortField = "",
      sortOrder,
    } = req.body;
    const user = req.user?.userId;
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized user.",
        data: null,
        error: "User not logged in.",
      });
    }
    //Initialize the redis
    const client = new Redis();
    //Convert query parameters to proper types
    const currentPage = parseInt(page as string, 10) || 10;
    const pageSize = parseInt(limit as string) || 10;

    //Generate unique cache key
    const cacheKey = `orders_${JSON.stringify(
      search
    )}_${currentPage}_${pageSize}_${sortField}_${sortOrder}`;

    //Check redis cache
    const cacheData = await client.get(cacheKey);
    if (cacheData) {
      return res.status(200).json({
        status: 200,
        message: "order list using cache",
        data: JSON.parse(cacheData),
        error: null,
      });
    }

    //Define searchFields
    const searchFields = [
      "orderId",
      "paymentStatus",
      "orderStatus",
      "totalAmount",
      "items.productName",
      "shippingAddress.addressLine1",
      "shippingAddress.city",
      "customerDetails.fullName",
      "customerDetails.contactNumber",
    ];

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(user),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "customeraddresses",
          localField: "shippingAddress",
          foreignField: "_id",
          as: "shippingAddress",
        },
      },
      {
        $unwind: {
          path: "$shippingAddress",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          orderId: 1,
          userId: 1,
          items: 1,
          totalAmount: 1,
          paymentStatus: 1,
          orderStatus: 1,
          shippingAddress: 1,
          "customerDetails.fullName": 1,
          "customerDetails.email": 1,
          "customerDetails.contactNumber": 1,
        },
      },
      ...buildSearchPaginationSortingPipeline(
        searchFields,
        search as string,
        sortField as string,
        sortOrder as "asc" | "desc",
        currentPage,
        pageSize
      ),
    ];

    const orderDetails = await Order.aggregate(pipeline);
    //Get total count for pagination
    const totalCountPipeline = pipeline.filter(
      (stage) => !("$skip" in stage || "$limit" in stage)
    );
    const totalCount = await Order.aggregate([
      ...totalCountPipeline,
      { $count: "totalCount" },
    ]);
    const totalOrders = totalCount.length > 0 ? totalCount[0].totalCount : 0;
    if (orderDetails.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No order has been created.",
        data: { orders: [], totalOrders, totalPages: 0, currentPage },
        error: null,
      });
    }
    //If the project length is greater than zero
    const responeData = {
      orders: orderDetails,
      totalOrders,
      totalPages: Math.ceil(totalOrders / pageSize),
      currentPage,
    };
    //Cachen data in redis
    await client.set(cacheKey, JSON.stringify(responeData), "EX", 30); //For 30 seconds
    return res.status(200).json({
      status: 200,
      message: "order list", // // Fetch the translated message
      data: responeData,
      error: null,
    });
  }
);
