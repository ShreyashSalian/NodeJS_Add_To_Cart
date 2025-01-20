import express from "express";
import { productValidator } from "../validations/product.validation";
import { verifyUser } from "../middlewares/auth.middleware";
import { validateApi } from "../middlewares/validate";
import {
  addNewProduct,
  deleteProduct,
  updateProductDetails,
  updateProductStatus,
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
//Used to update the status
productRoutes.post(
  "/update-status/:productId",
  verifyUser,
  updateProductStatus
);

export default productRoutes;
