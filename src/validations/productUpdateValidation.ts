import { checkSchema, Meta } from "express-validator";
import fs from "fs";

export const productUpdateValidator = () => {
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
          let parsedProductSize;

          // Parse `productSize` only if it's a string
          try {
            parsedProductSize =
              typeof req.body.productSize === "string"
                ? JSON.parse(req.body.productSize)
                : req.body.productSize;
          } catch (error) {
            throw new Error(
              "Invalid format for product size. Ensure it's valid JSON."
            );
          }

          // Validate that `productSize` is an array
          if (!Array.isArray(parsedProductSize)) {
            throw new Error("Product size must be an array.");
          }

          // Ensure the array has at least one valid entry if no default price is provided
          if (parsedProductSize.length === 0 && !req.body.defaultPrice) {
            throw new Error(
              "Please provide either a default price or product sizes."
            );
          }

          // Validate each size object
          for (const size of parsedProductSize) {
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
