import express, { Request, Response } from "express";
import { User } from "../models/user.model";
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
