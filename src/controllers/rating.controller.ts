import express from "express";
import { asyncHandler } from "../utils/fuction";
import { Product } from "../models/product.model";
import { Rating } from "../models/rating.model";

//POST=> Used to add or update the rating
export const addOrUpdateRating = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { productId, rating } = req.body;
    const userId = req.user?.userId;
    //Check if the product exist
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(200).json({
        status: 200,
        message: null,
        data: null,
        error: "Sorry, no product found",
      });
    }
    //Check if the user has alreadt rated this product
    const existingRating = await Rating.findOne({ productId, userId });
    if (existingRating) {
      //Update the existing rating
      existingRating.rating = rating;
      await existingRating.save();
      res.status(200).json({
        message: "Rating updated successfully",
        status: 200,
        error: null,
        data: null,
      });
    } else {
      //Add new rating
      await Rating.create({ productId, userId, rating });
      res.status(200).json({
        message: "Rating added successfully",
        status: 200,
        error: null,
        data: null,
      });
    }
    //Recalculate and update the product's average rating
    const allRatings = await Rating.find({ productId });
    const totalRating = allRatings.length;
    const averageRating =
      allRatings.reduce((sum, rate) => sum + rate.rating, 0) / totalRating;
    product.averageRating = averageRating;
    product.totalRating = totalRating;
    await product.save();
  }
);

//POST => Used to delete the rating
export const deleteRating = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { productId } = req.body;
    const userId = req.user?.userId;
    //Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(200).json({
        status: 200,
        message: null,
        data: null,
        error: "Sorry, no product found",
      });
    }
    //Check if the user has rated the product
    const existingRating = await Rating.findOne({ productId, userId });
    if (!existingRating) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Rating not found for this user",
      });
    }
    //Delete the user rating
    await Rating.findOneAndDelete({ productId, userId });
    //Recalculate and update the product's average rating
    const allRatings = await Rating.find({ productId });
    const totalRating = allRatings.length;
    const averageRating =
      allRatings.reduce((sum, rate) => sum + rate.rating, 0) / totalRating;
    product.averageRating = averageRating;
    product.totalRating = totalRating;
    await product.save();
    res.status(200).json({
      status: 200,
      message: "Rating deleted successfully",
      data: {
        averageRating: product.averageRating,
        totalRatings: product.totalRating,
      },
    });
  }
);
