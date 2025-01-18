import express from "express";
import { validateApi } from "../middlewares/validate";
import { userValidation } from "../validations/userValidation";
import { addNewUser } from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";

const userRoutes = express.Router();
userRoutes.post(
  "/",
  upload.single("profileImage"),
  userValidation(),
  validateApi,
  addNewUser
);

export default userRoutes;
