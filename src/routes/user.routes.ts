import express from "express";
import { validateApi } from "../middlewares/validate";
import { userValidation } from "../validations/userValidation";
import {
  addNewUser,
  updateProfileImage,
  updateUserDetails,
} from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { verifyUser } from "../middlewares/auth.middleware";
import { updateProfileImageValidation } from "../validations/updateProfileImageValidation";

const userRoutes = express.Router();
//Update the new User
userRoutes.post(
  "/",
  upload.single("profileImage"),
  userValidation(),
  validateApi,
  addNewUser
);
//Update the user details
userRoutes.put("/", verifyUser, updateUserDetails);
//Update the profileImage
userRoutes.post(
  "/update-profileImage",
  verifyUser,
  upload.single("profileImage"),
  updateProfileImageValidation(),
  validateApi,
  updateProfileImage
);

export default userRoutes;
