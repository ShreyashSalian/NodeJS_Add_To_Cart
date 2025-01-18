import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";

//This function is used to trim the input

export const trimInput = (value: string) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};

//Used to created the start for the function
export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<Response | void>
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

//This function is used to generate token for the email verification
export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Typing for Express Request with single file upload support
export interface RequestWithFile extends Request {
  file?: Express.Multer.File; // Multer's file object for a single file
}
