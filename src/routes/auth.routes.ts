import exprss from "express";
import { login } from "../controllers/auth.controller";
import { loginValidation } from "../validations/login.validation";
import { validateApi } from "../middlewares/validate";

const authRoutes = exprss.Router();
authRoutes.post("/login", loginValidation(), validateApi, login);

export default authRoutes;
