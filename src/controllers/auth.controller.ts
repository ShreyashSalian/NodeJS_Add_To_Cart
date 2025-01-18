import express from "express";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/fuction";
import { Login } from "../models/login.model";

// Generate the Access and refresh token-----------
const generateRefreshAndAccessToken = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  return { accessToken, refreshToken };
};
// -------------

//POST => Allow the user to login
export const login = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { emailOrContactNumber, password } = req.body;
    const userFound = await User.findOne({
      $or: [
        {
          email: emailOrContactNumber,
        },
        {
          contactNumber: emailOrContactNumber,
        },
      ],
    });
    //Check whether user found or not
    if (!userFound) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error:
          "Sorry, no user has found with the given email or contact Number.",
      });
    }
    //Check whether the user has verified his/her account by checking the mail
    if (!userFound.isEmailVerified) {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error:
          "Please check your email and click on link to verify your account.",
      });
    }
    //Check whether the account has not disabled or deleted.
    if (userFound.isDeleted) {
      return res.status(403).json({
        status: 403,
        message: null,
        data: null,
        error: "Account is disabled. Please contact support.",
      });
    }
    //Check for the password
    const passwordCheck: boolean = await userFound.comparePassword(password);
    if (!passwordCheck) {
      return res.status(401).json({
        status: 401,
        message: null,
        data: null,
        error: "Please enter valid password.",
      });
    }
    //Generate the access and refresh token
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      userFound?._id
    );
    //Add the data in the login model to allow the user to login
    await Login.create({
      userId: userFound?._id,
      email: userFound?.email,
      token: accessToken,
      refreshToken: refreshToken,
    });
    //To Display the details of the login users-
    const loginUser = await User.findById(userFound?._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        status: 200,
        message: "User has login successfully.",
        data: { accessToken, refreshToken, loginUser },
        error: null,
      });
  }
);

//GET => Allow the user to logout.
export const logout = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    if (!req.user?.userId) {
      const responsePayLoad = {
        status: 200,
        message: null,
        data: null,
        error: "Invalid or missing user_id in request",
      };
      res.status(200).json(responsePayLoad);
    }
    const userDetail = await Login.findByIdAndDelete({
      userId: req.user?.userId,
    });
    if (!userDetail) {
      const responsePayLoad = {
        status: 200,
        message: null,
        data: null,
        error: "User can not logout.",
      };
      res.status(200).json(responsePayLoad);
    } else {
      const options = {
        httpOnly: true,
        secure: true,
      };

      const responsePayLoad = {
        status: 200,
        message: "User logout successfully",
        data: null,
        error: null,
      };
      res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(responsePayLoad);
    }
  }
);
