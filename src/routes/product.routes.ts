import express from "express";
import { productValidator } from "../validations/product.validation";
import { verifyUser } from "../middlewares/auth.middleware";
import { validateApi } from "../middlewares/validate";
import {
  addNewProduct,
  deleteMutipleProductImages,
  deleteProduct,
  getProductByID,
  listAllProducts,
  updateProductDetails,
  updateProductStatus,
  uploadMultipleProductImages,
} from "../controllers/product.controller";
import { upload } from "../middlewares/multer.middleware";
import { productUpdateValidator } from "../validations/productUpdateValidation";

const productRoutes = express.Router();
//Used to add the product
productRoutes.post(
  "/",
  verifyUser,
  upload.array("productImages", 10),
  productValidator(),
  validateApi,
  addNewProduct
);
//Used to update the product
productRoutes.put(
  "/:productId",
  verifyUser,
  productUpdateValidator(),
  validateApi,
  updateProductDetails
);
//Used to delete the product
productRoutes.delete("/:productId", verifyUser, deleteProduct);

//Used to get the productById
productRoutes.get("/:productId", verifyUser, getProductByID);
//Used to update the status
productRoutes.post(
  "/update-status/:productId",
  verifyUser,
  updateProductStatus
);
//Used to delete the multiple product images
productRoutes.post(
  "/delete-product-images/:productId",
  verifyUser,
  deleteMutipleProductImages
);
//Used to upload the multiple product images
productRoutes.post(
  "/upload-product-images",
  verifyUser,
  uploadMultipleProductImages
);
//Used to list all the products with pagination sorting and searching
productRoutes.post("/lists", verifyUser, listAllProducts);

export default productRoutes;
