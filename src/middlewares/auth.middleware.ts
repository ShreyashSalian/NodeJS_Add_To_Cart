import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "../utils/fuction";
import { User } from "../models/user.model";
import dotenv from "dotenv";
import { Login } from "../models/login.model";
dotenv.config();

//Middleware to verify the user
export const verifyUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      // Extract token from cookies or Authorization header
      const token: string | undefined =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "").trim();

      if (!token) {
        return res.status(401).json({
          status: 401,
          message: null,
          data: null,
          error: "Unauthorized request. No token provided.",
        });
      }

      const secretKey = process.env.ACCESS_TOKEN;
      if (!secretKey) {
        throw new Error("ACCESS_TOKEN environment variable is not set");
      }

      // Decode the token
      const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
      console.log("Decoded Token:", decodedToken);

      // Validate user details
      const userDetails = await Login.findOne({
        token,
        email: decodedToken.email,
        userId: decodedToken.userId,
      });

      if (!userDetails) {
        return res.status(401).json({
          status: 401,
          message: null,
          data: null,
          error: "Unauthorized request. Invalid token.==========",
        });
      }

      // Store user details in request
      req.user = userDetails;
      next();
    } catch (err: any) {
      console.error("Error verifying token:", err.message);

      if (["TokenExpiredError", "JsonWebTokenError"].includes(err.name)) {
        return res.status(401).json({
          status: 401,
          message: null,
          data: null,
          error: `Unauthorized request. ${err.message}`,
        });
      }

      return res.status(500).json({
        status: 500,
        message: "Internal server error.",
        data: null,
        error: "An error occurred during token verification.",
      });
    }
  }
);
//Middleware to check whether user is admin
export const AdminUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure req.user is defined
      if (!req.user?.userId) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized request. User information is missing.",
          data: null,
          error: null,
        });
      }

      // Fetch user details
      const user = await User.findById(req.user?.userId);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found.",
          data: null,
          error: null,
        });
      }
      if (user?.role === "admin") {
        next();
      } else {
        return res.status(401).json({
          status: 401,
          message: null,
          data: null,
          error: "Unauthorized request. Sorry you are not allowed to this.",
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: 500,
        data: null,
        message: null,
        error: "Internal server error.",
      });
    }
  }
);
