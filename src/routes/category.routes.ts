import express from "express";
import { categoryValidation } from "../validations/categoryValidation";
import { validateApi } from "../middlewares/validate";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  addNewCategory,
  deleteCategory,
  listAllCategory,
  softDeleteCategory,
  updateCategory,
  updateOrDeleteCategoryImage,
} from "../controllers/category.controller";
import { upload } from "../middlewares/multer.middleware";
import { updateOrDeleteCategoryImageValidation } from "../validations/categoryImageValidation";

const categoryRoutes = express.Router();
//Used to add the category
categoryRoutes.post(
  "/",
  verifyUser,
  upload.single("categoryImage"),
  categoryValidation(),
  validateApi,

  addNewCategory
);
//List all categories
categoryRoutes.get("/", listAllCategory);

//Used to update the category
categoryRoutes.put(
  "/:categoryId",
  verifyUser,
  categoryValidation(),
  validateApi,
  updateCategory
);
//Soft delete  the category
categoryRoutes.post("/:categoryId", verifyUser, softDeleteCategory);
//Delete the category
categoryRoutes.delete("/:categoryId", verifyUser, deleteCategory);
categoryRoutes.post(
  "/update-status/:categoryId",
  verifyUser,
  softDeleteCategory
);
//Update or delete the categoryImage
categoryRoutes.post(
  "/category-image/:categoryId",
  verifyUser,
  upload.single("categoryImage"),
  updateOrDeleteCategoryImageValidation(),
  validateApi,
  updateOrDeleteCategoryImage
);
export default categoryRoutes;
