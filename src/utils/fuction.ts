import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import fs from "fs";
import mongoose from "mongoose";

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

export interface CustomRequestWithFiles extends express.Request {
  files?: Express.Multer.File[]; // Adjusted to handle multiple files
}

// Utility function to delete files if validation fails
export const deleteFile = (file: Express.Multer.File | undefined) => {
  if (file) {
    fs.unlinkSync(file.path);
  }
};

// Allowed file types and maximum size
export const allowedMimeTypes = ["image/jpeg", "image/png"];
export const maxSize = 2 * 1024 * 1024; // 2MB

//Used to create a common function for sorting, searching and pagination
export const buildSearchPaginationSortingPipeline = (
  fields: string[],
  search: string,
  sortBy: string,
  sortOrder: "asc" | "desc",
  page: number,
  limit: number
) => {
  const pipeline: any[] = [];

  // Search stage
  if (search) {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: fields.map((field) => ({ [field]: regex })),
      },
    });
  }

  // Sorting stage (add only if sortBy is valid)
  if (sortBy) {
    pipeline.push({
      $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
    });
  }

  // Pagination stages
  pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

  return pipeline;
};

//Used to capitalize the word

export const toCapitalCase = (value: string): string => {
  if (!value) return value; // Return as is if the value is empty or null
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
};

//Convert the first letter to capital
export const capitalizeFirstLetter = (value: string): string => {
  if (!value) return value; // Return as is if the value is empty or null
  return value.charAt(0).toUpperCase() + value.slice(1).trim();
};

//Common function for the pagination and sorting
export const executePaginationAggregation = async (
  model: mongoose.Model<any>,
  pipeline: any[]
): Promise<{ results: any[]; totalCount: number }> => {
  try {
    // Filter out $skip and $limit stages
    const totalCountPipeline = pipeline.filter(
      (stage) => !("$skip" in stage || "$limit" in stage)
    );

    // Calculate total count
    const totalCountResult = await model.aggregate([
      ...totalCountPipeline,
      { $count: "totalCount" },
    ]);

    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

    // Get paginated results
    const results = await model.aggregate(pipeline);

    return { results, totalCount };
  } catch (error: any) {
    throw new Error(`Error in aggregation: ${error.message}`);
  }
};
