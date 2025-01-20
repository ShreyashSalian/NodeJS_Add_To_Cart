import express from "express";
import { Product } from "../models/product.model";
import { asyncHandler, RequestWithFile } from "../utils/fuction";

//POST => Used to add the new product
export const addNewProduct = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const customReq = req as RequestWithFile;
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
