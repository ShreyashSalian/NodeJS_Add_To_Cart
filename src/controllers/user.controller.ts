import express, { Request, Response } from "express";
import { User } from "../models/user.model";
import path from "path";
import fs from "fs";
import {
  asyncHandler,
  generateEmailVerificationToken,
  RequestWithFile,
} from "../utils/fuction";
import { verifyEmail } from "../utils/sendEmail";

//POST=> Used to add the new user
export const addNewUser = asyncHandler(async (req: Request, res: Response) => {
  const customReq = req as RequestWithFile;
  const { email, fullName, password, role, contactNumber } = customReq.body;
  console.log(customReq);

  //Check user already exist or not
  const userExists = await User.findOne({
    $or: [
      {
        email: email,
      },
      {
        contactNumber: contactNumber,
      },
    ],
  });
  if (userExists) {
    return res.status(409).json({
      status: 409,
      message: null,
      data: null,
      error: "User already exists with the given email or contact number",
    });
  }
  //Extract the profile image path if provided
  const profileImage = customReq?.file?.filename || "";

  //Used to send the email verification code to user to verify the user
  const emailVerificationToken = await generateEmailVerificationToken();
  //Used to send the mail for verification
  await verifyEmail(email, emailVerificationToken);
  //Used to create user
  const userCreation = await User.create({
    fullName,
    contactNumber,
    email,
    password,
    role,
    profileImage,
    emailVerificationToken: emailVerificationToken,
  });
  //Retrive created user without sensitive fields.
  const createdUser = await User.findById(userCreation?._id).select(
    "-password -refreshToken -emailVerificationToken"
  );
  if (!createdUser) {
    return res.status(500).json({
      status: 500,
      message: null,
      data: null,
      error: "User creation failed.",
    });
  }
  //Return success Response
  return res.status(201).json({
    status: 201,
    message: "User created successfully.",
    data: createdUser,
    error: null,
  });
});

//UPDATE => Used to update the user details
export const updateUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { contactNumber, fullName } = req.body;
    const user = req.user?.userId;
    const updateDetail = await User.findByIdAndUpdate(
      user,
      {
        $set: {
          fullName,
          contactNumber,
        },
      },
      {
        new: true,
      }
    ).select("-password -refreshToken");
    if (!updateDetail) {
      return res.status(500).json({
        status: 500,
        message: null,
        data: null,
        error: "Sorry, User details can not be updated.",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "The user details has been updated.",
        data: updateDetail,
        error: null,
      });
    }
  }
);

//POST => Used to update the user profile Image
export const updateProfileImage = asyncHandler(
  async (req: Request, res: Response) => {
    const customReq = req as RequestWithFile;
    // Find the user by ID
    const user = await User.findById(req.user?.userId).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(400).json({
        status: 400,
        error: "User not found",
        message: null,
        data: null,
      });
    }

    try {
      // Delete old profile image if it exists
      if (user.profileImage) {
        const oldImagePath = path.resolve(
          __dirname,
          "../../public/images",
          user.profileImage
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old profile image:", err.message);
          }
        });
      }

      // Update or remove the profile image
      if (customReq.file) {
        // If a new image is provided, update the field
        user.profileImage = customReq.file.filename;
      } else {
        // If no file is provided, clear the profileImage field
        user.profileImage = "";
      }

      // Save the user with the updated profile image
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({
        status: 200,
        message: customReq.file
          ? "Profile image updated successfully."
          : "Profile image removed successfully.",
        data: user,
        error: null,
      });
    } catch (error: any) {
      console.error("Error updating profile image:", error.message);
      return res.status(500).json({
        status: 500,
        error: error.message,
        message: "Failed to update or remove profile image.",
        data: null,
      });
    }
  }
);
