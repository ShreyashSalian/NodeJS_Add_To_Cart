import { checkSchema, Meta } from "express-validator";
import fs from "fs";

export const productValidator = () => {
  return checkSchema({
    productName: {
      notEmpty: {
        errorMessage: "Please enter the product name.",
      },
    },
    productDescription: {
      notEmpty: {
        errorMessage: "Please enter the product description.",
      },
    },
    productQuantity: {
      custom: {
        options: (value: any, { req }: { req: any }) => {
          if (
            !value &&
            (!req.body.productSize || req.body.productSize.length === 0)
          ) {
            throw new Error("Please provide the product quantity.");
          }
          return true;
        },
      },
    },
    productImages: {
      custom: {
        options: (value: any, { req }: { req: any }) => {
          if (!Array.isArray(req.files) || req.files.length === 0) {
            throw new Error("Please upload at least one product image.");
          }

          const allowedMimeTypes = ["image/jpeg", "image/png"];
          (req.files as Express.Multer.File[]).forEach((file) => {
            if (!allowedMimeTypes.includes(file.mimetype)) {
              (req.files as Express.Multer.File[]).forEach((f) =>
                fs.unlinkSync(f.path)
              );
              throw new Error("Only .jpeg and .png formats are allowed.");
            }
            if (file.size > 3 * 1024 * 1024) {
              (req.files as Express.Multer.File[]).forEach((f) =>
                fs.unlinkSync(f.path)
              );
              throw new Error("Image size should not exceed 3MB.");
            }
          });
          return true;
        },
      },
    },
    defaultPrice: {
      custom: {
        options: (value: any, { req }: { req: any }) => {
          if (
            !value &&
            (!req.body.productSize || req.body.productSize.length === 0)
          ) {
            throw new Error(
              "Please provide either a default price or product sizes."
            );
          }
          return true;
        },
      },
      isNumeric: {
        errorMessage: "Default price must be a valid number.",
      },
      optional: true, // Correctly set to 'true' as per OptionalOptions
    },
    productSize: {
      custom: {
        options: (value: any, { req }: { req: any }) => {
          const productSize = req.body.productSize
            ? JSON.parse(req.body.productSize)
            : [];

          if (productSize.length === 0 && !req.body.defaultPrice) {
            throw new Error(
              "Please provide either a default price or product sizesxx."
            );
          }

          if (!Array.isArray(productSize)) {
            throw new Error("Product size must be an array.");
          }

          for (const size of productSize) {
            if (!size.size || !size.price || !size.quantity) {
              throw new Error(
                "Each product size must have a size, price, and quantity."
              );
            }
          }

          return true;
        },
      },
    },
  });
};
