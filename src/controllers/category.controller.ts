import express from "express";
import {
  asyncHandler,
  CategoryBody,
  RequestWithFile,
  ReturnResponseBody,
} from "../utils/fuction";
import { Category } from "../models/category.model";
import path from "path";
import fs from "fs";
import { error } from "console";

//POST => Used to create a new category
export const addNewCategory = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const customReq = req as RequestWithFile;
    const {
      categoryName,
      categoryDescription,
      categorySlug,
      keywords,
      status,
      isFeatured,
    }: {
      categoryName: string;
      categoryDescription: string;
      categorySlug: string;
      keywords: string[];
      status: string;
      isFeatured: boolean;
    } = customReq.body;

    const categoryImage = customReq?.file?.filename || "";
    const categoryCreation = await Category.create({
      categoryName,
      categoryDescription,
      categorySlug,
      keywords,
      status,
      categoryImage,
      isFeatured,
    });
    if (!categoryCreation) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the category can not e created.",
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "User created successfully.",
        data: categoryCreation,
        error: null,
      });
    }
  }
);

//PUT => Used to update the category details
export const updateCategory = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { categoryId } = req.params;
    const {
      categoryName,
      categoryDescription,
      categorySlug,
      keywords,
      status,
      isFeatured,
    }: {
      categoryName: string;
      categoryDescription: string;
      categorySlug: string;
      keywords: string[];
      status: string;
      isFeatured: boolean;
    } = req.body;

    const updateCategoryDetails = await Category.findByIdAndUpdate(
      categoryId,
      {
        $set: {
          categoryName,
          categoryDescription,
          categorySlug,
          keywords,
          status,
          isFeatured,
        },
      },
      {
        new: true,
      }
    );
    if (!updateCategoryDetails) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the category can not be updated.",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "The category has been updated successfully.",
        data: updateCategoryDetails,
        error: null,
      });
    }
  }
);

//POST => Used to soft delete the category
export const softDeleteCategory = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { categoryId } = req.params;
    const categoryFound = await Category.findById(categoryId);
    if (!categoryFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, no category found with the given ID.",
      });
    }
    //Find the id and update the isdeletedField
    const updateCategoryStatus = await Category.findByIdAndUpdate(categoryId, {
      $set: {
        isDeleted: true,
      },
    });
    if (!updateCategoryStatus) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the category can not be deleted.",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "The category has been updated.",
        data: null,
        error: null,
      });
    }
  }
);

//DELETE => Used to delete the category
export const deleteCategory = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { categoryID } = req.params;
    const categoryFound = await Category.findById(categoryID);
    if (!categoryFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, no category found with given ID",
      });
    }
    const deleteCategory = await Category.findByIdAndDelete(categoryID);
    if (deleteCategory) {
      return res.status(200).json({
        status: 200,
        message: "Category deleted successfully.",
        data: null,
        error: null,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: null,
        data: null,
        error: "Sorry, the category can not be deleted.",
      });
    }
  }
);

//GET => List all Category
export const listAllCategory = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const allCategory = await Category.find({ isDeleted: false });
    if (allCategory.length === 0) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, no category found",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "The category list.",
        data: allCategory,
        error: null,
      });
    }
  }
);

//POST => used to delete or update the category image
export const updateOrDeleteCategoryImage = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { categoryId } = req.params;
    const customReq = req as RequestWithFile;

    // Find category by ID
    const categoryFound = await Category.findById(categoryId);
    if (!categoryFound) {
      return res.status(404).json({
        status: 404,
        error: "Category not found",
        message: null,
        data: null,
      });
    }

    try {
      // Delete old category image if it exists
      if (categoryFound.categoryImage) {
        const oldImagePath = path.resolve(
          __dirname,
          "../../public/images",
          categoryFound.categoryImage
        );
        fs.unlink(oldImagePath, (error) => {
          if (error) {
            console.error(
              "Error while deleting the category image:",
              error.message
            );
          }
        });
      }

      // Update or remove the category image
      if (customReq.file) {
        categoryFound.categoryImage = customReq.file.filename;
      } else {
        categoryFound.categoryImage = "";
      }

      // Save the updated category
      await categoryFound.save({ validateBeforeSave: false });

      return res.status(200).json({
        status: 200,
        message: customReq.file
          ? "Category image updated successfully."
          : "Category image removed successfully.",
        data: categoryFound,
        error: null,
      });
    } catch (error: any) {
      console.error("Error updating category image:", error.message);
      return res.status(500).json({
        status: 500,
        error: error.message,
        message: "Failed to update or remove category image.",
        data: null,
      });
    }
  }
);
