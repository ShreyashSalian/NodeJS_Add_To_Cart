import { checkSchema } from "express-validator";
import fs from "fs";

export const productImageUploadValidation = () => {
  return checkSchema({
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
  });
};
