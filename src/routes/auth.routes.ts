import exprss from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  resetPassword,
  userEmailVerification,
} from "../controllers/auth.controller";
import { loginValidation } from "../validations/login.validation";
import { validateApi } from "../middlewares/validate";
import { verifyUser } from "../middlewares/auth.middleware";
import { changePasswordValidation } from "../validations/changePassword.validation";
import { forgotPasswordValidation } from "../validations/forgotPassword.validation";
import { resetPasswordValidation } from "../validations/resetPassword.validation";

const authRoutes = exprss.Router();
authRoutes.post("/login", loginValidation(), validateApi, login);
authRoutes.get("/logout", verifyUser, logout);
authRoutes.post(
  "change-password",
  verifyUser,
  changePasswordValidation(),
  validateApi,
  changePassword
);
authRoutes.post(
  "/forgot-password",
  forgotPasswordValidation(),
  validateApi,
  forgotPassword
);
authRoutes.post(
  "/reset-password",
  resetPasswordValidation(),
  validateApi,
  resetPassword
);
authRoutes.post("/email-verification", userEmailVerification);

export default authRoutes;
