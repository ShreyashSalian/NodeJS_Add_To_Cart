import express from "express";
import { Product } from "../models/product.model";
import {
  asyncHandler,
  buildSearchPaginationSortingPipeline,
  CustomRequestWithFiles,
} from "../utils/fuction";
import fs from "fs";
import path from "path";
import Redis from "ioredis";
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
    //initialize the redis

    const client = new Redis();
    //Convert query parameters to proper types
    const currentPage = parseInt(page as string, 10) || 10;
    const pageSize = parseInt(limit as string, 10) || 10;

    //Generate unique cache key
    const cacheKey = `products_${JSON.stringify(
      search
    )}_${currentPage}_${pageSize}_${sortField}_${sortOrder}`;

    //Check redis cache
    const cacheData = await client.get(cacheKey);
    if (cacheData) {
      console.log(res.__("productList"));
      console.log("Cache");
      return res.status(200).json({
        status: 200,
        sent: res.__("productList"),
        message: "product list using cache",
        data: JSON.parse(cacheData),
        error: null,
      });
    }
    //Define searchable fields
    const searchFields = ["productName", "productDescription", "ratingCount"];
    //Build the aggregation pipeline
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
    //Execute the pipeline

    const productDetails = await Product.aggregate(pipeline);
    //Get total count for pagination
    const totalCountPipeline = pipeline.filter(
      (stage) => !("$skip" in stage || "$limit" in stage)
    );
    const totalCount = await Product.aggregate([
      ...totalCountPipeline,
      { $count: "totalCount" },
    ]);
    const totalProducts = totalCount.length > 0 ? totalCount[0].totalCount : 0;
    if (productDetails.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No project has been created.",
        data: { products: [], totalProducts, totalPages: 0, currentPage },
        error: null,
      });
    }
    //If the project length is greater than zero
    const responeData = {
      projects: productDetails,
      totalProducts,
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage,
    };
    //Cachen data in redis
    await client.set(cacheKey, JSON.stringify(responeData), "EX", 30); //For 30 seconds
    return res.status(200).json({
      status: 200,
      sent: res.__("productList"),
      message: "Product list", // // Fetch the translated message
      data: responeData,
      error: null,
    });
  }
);
