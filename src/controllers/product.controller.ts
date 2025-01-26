import express from "express";
import { Product } from "../models/product.model";
import {
  asyncHandler,
  buildSearchPaginationSortingPipeline,
  CustomRequestWithFiles,
  executePaginationAggregation,
} from "../utils/fuction";
import fs from "fs";
import path from "path";
import Redis from "ioredis";
import mongoose from "mongoose";
//POST => Used to add the new product
export const addNewProduct = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const customReq = req as CustomRequestWithFiles;
    const {
      productName,
      productDescription,
      productQuantity,
      productSize,
      defaultPrice,
      productCategory,
    } = customReq.body;

    // Handle file uploads
    // Handle file uploads
    let productImageList: string[] | null =
      customReq.files && Array.isArray(customReq.files)
        ? customReq.files.map((file) => file.filename)
        : null;

    const newProduct = await Product.create({
      productName,
      productDescription,
      productQuantity,
      productSize: productSize ? JSON.parse(productSize) : [],
      defaultPrice: defaultPrice ? defaultPrice : undefined,
      productCategory,
      productImages: productImageList,
    });
    if (newProduct) {
      return res.status(200).json({
        status: 200,
        message: "Product added successfully.",
        data: newProduct,
        error: null,
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: "Sorry, the product cannot be added.",
        data: null,
        error: "Product creation failed.",
      });
    }
  }
);

//PUT => Used to update the details of the product
export const updateProductDetails = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const { productId } = req.params;
    const {
      productName,
      productDescription,
      productQuantity,
      productSize,
      defaultPrice,
      productCategory,
    } = req.body;

    const productFound = await Product.findById(productId);
    if (!productFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, the product was not found.",
      });
    }

    let parsedProductSize;
    try {
      // Check if productSize is a string and parse it, otherwise use it as is
      parsedProductSize =
        typeof productSize === "string" ? JSON.parse(productSize) : productSize;
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: null,
        data: null,
        error:
          "Invalid format for productSize. Ensure it's a valid JSON array.",
      });
    }

    // Update the product details
    const productUpdate = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          productName,
          productDescription,
          productQuantity,
          productSize: parsedProductSize || [],
          defaultPrice: defaultPrice || undefined,
          productCategory,
        },
      },
      {
        new: true, // Return the updated document
      }
    );

    if (!productUpdate) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the product could not be updated.",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Product updated successfully.",
        data: productUpdate,
        error: null,
      });
    }
  }
);

//POST => Used to update the status of the product
export const updateProductStatus = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const { productId } = req.params;
    const productFound = await Product.findById(productId);
    if (!productFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, the product was not found.",
      });
    }
    const updateStatus = await Product.findByIdAndUpdate(productId, {
      $set: {
        isDeleted: true,
      },
    });
    if (!updateStatus) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the product could not be deleted.",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Product deleted successfully.",
        data: null,
        error: null,
      });
    }
  }
);

//DELETE => Used to delete the product
export const deleteProduct = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { productId } = req.params;
    const productFound = await Product.findById(productId);
    if (!productFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, the product was not found.",
      });
    }
    const deleteProduct = await Product.findByIdAndDelete(productId);
    if (!deleteProduct) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the product can not be deleted.",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "The product has been deleted successfully.",
        data: null,
        error: null,
      });
    }
  }
);

//GET => Used to get the product by ID
export const getProductByID = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { productId } = req.params;
    const productFound = await Product.findById(productId);
    if (!productFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, the product was not found.",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "The product detail",
        data: productFound,
        error: null,
      });
    }
  }
);
//POST => Used to delete the multiple images of the product
export const deleteMutipleProductImages = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { productId } = req.params;
    const { productimagesList } = req.body;
    if (!Array.isArray(productimagesList) || productimagesList.length === 0) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: null,
        error: "Please enter the product image that you want to delete.",
      });
    }
    //Find the product
    const productFound = await Product.findById(productId);
    if (!productFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, no task product with the given task ID.",
      });
    }
    //Filter the images that you wanted to delete from the product images list
    const validImages = productimagesList.filter((images) => {
      productFound?.productImages.includes(images);
    });
    if (validImages.length === 0) {
      return res.status(400).json({
        status: 400,
        message: null,
        data: null,
        error: "No valid image to delete.",
      });
    }
    //Delete the product images from the fileSystem
    const deleteProductImages = validImages.map(async (image) => {
      const filePath = path.resolve(__dirname, "../../public/images", image);
      try {
        await fs.unlink(filePath, (err) => {
          console.log(err);
        });
      } catch (err: any) {
        console.log(`Failed to delete the image : ${image} : ${err}`);
      }
    });
    await Promise.all(deleteProductImages);
    //Remove the image from the product
    productFound.productImages = productFound.productImages.filter(
      (image) => !validImages.includes(image)
    );
    await productFound.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: 200,
      data: productFound,
      message: "The product images has been updated",
      error: null,
    });
  }
);

//POST => Used to update the mutiple images of the product
export interface RequestWithFiles extends express.Request {
  files?: Express.Multer.File[]; // Adjusted to handle multiple files
}
//POST => Used to upload multiple images for the product
export const uploadMultipleProductImages = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const { productId } = req.params;

    // Find the product
    const productFound = await Product.findById(productId);
    if (!productFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        error: "Sorry, no product found.",
        data: null,
      });
    }

    // Typecast the request to handle multiple files
    const customReq = req as CustomRequestWithFiles;

    // Ensure files are present and extract their filenames
    const productImages: string[] =
      customReq.files?.map((file) => file.filename) || [];
    if (productImages.length === 0) {
      return res.status(400).json({
        status: 400,
        message: null,
        data: null,
        error: "No attachments found in request.",
      });
    }

    // Push new image filenames into the product's existing `productImages` array
    productFound.productImages.push(...productImages);

    // Save the updated product
    await productFound.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: 200,
      message: "Product images uploaded successfully.",
      data: productFound,
      error: null,
    });
  }
);
//POST => List all product with pagination, sorting and searching
export const listAllProducts = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortField = "",
      sortOrder,
    } = req.body;

    const client = new Redis(); // Ideally, move this to a shared utility to reuse across controllers

    // Convert query parameters to proper types
    const currentPage = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    // Generate a unique cache key
    const cacheKey = `products_${JSON.stringify(
      search
    )}_${currentPage}_${pageSize}_${sortField}_${sortOrder}`;

    // Check Redis cache
    const cacheData = await client.get(cacheKey);
    if (cacheData) {
      console.log("Cache hit");
      return res.status(200).json({
        status: 200,
        sent: res.__("productList"),
        message: "Product list fetched from cache",
        data: JSON.parse(cacheData),
        error: null,
      });
    }

    // Define searchable fields
    const searchFields = ["productName", "productDescription", "ratingCount"];

    // Build the aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "categories",
          localField: "productCategory",
          foreignField: "_id",
          as: "categoryDetail",
        },
      },
      {
        $unwind: {
          path: "$categoryDetail",
          preserveNullAndEmptyArrays: true,
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

    // Execute the common function
    const { results, totalCount } = await executePaginationAggregation(
      Product,
      pipeline
    );

    if (results.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No products found.",
        data: { products: [], totalCount, totalPages: 0, currentPage },
        error: null,
      });
    }

    // Prepare response data
    const responseData = {
      products: results,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage,
    };

    // Cache the data in Redis
    await client.set(cacheKey, JSON.stringify(responseData), "EX", 30); // Cache for 30 seconds

    return res.status(200).json({
      status: 200,
      sent: res.__("productList"),
      message: "Product list",
      data: responseData,
      error: null,
    });
  }
);

//POST => list all product based on the given category id
export const listProductsById = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { categoryIds } = req.body;
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid input. Please provide an array of category IDs.",
        data: null,
        error: "Invalid category IDs.",
      });
    }
    try {
      const products = await Product.aggregate([
        {
          $match: {
            productCategory: {
              $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "productCategory",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $project: {
            "categoryDetails.name": 1, // Include only relevant fields from categoryDetails
            "categoryDetails.description": 1,
          },
        },
      ]);
      if (products.length === 0) {
        return res.status(404).json({
          status: 404,
          message: null,
          data: null,
          error: "No products found for the given category IDs.",
        });
      } else {
        return res.status(200).json({
          status: 200,
          message: "Products with category details retrieved successfully",
          data: products,
          error: null,
        });
      }
    } catch (err: any) {
      return res.status(400).json({
        status: 400,
        message: "Invalid input. Please provide an array of category IDs.",
        data: null,
        error: "Invalid category IDs.",
      });
    }
  }
);
