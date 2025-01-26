import express from "express";
import { User } from "../models/user.model";
import {
  asyncHandler,
  ChangePasswordBody,
  IUserRequest,
  LoginRequestBody,
  ForgotPasswordBody,
  ReturnResponseBody,
  ResetPasswordBody,
} from "../utils/fuction";
import { Login } from "../models/login.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { forgotPasswordMail } from "../utils/sendEmail";

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
  async (
    req: express.Request<{}, {}, LoginRequestBody>,
    res: express.Response
  ): Promise<express.Response> => {
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
  async (
    req: IUserRequest,
    res: express.Response
  ): Promise<express.Response> => {
    if (!req.user?.userId) {
      const responsePayload = {
        status: 200,
        message: null,
        data: null,
        error: "Invalid or missing user_id in request",
      };
      return res.status(200).json(responsePayload);
    }

    // Delete user session from the Login model
    const userDetail = await Login.findOneAndDelete({
      userId: req.user.userId,
    });

    if (!userDetail) {
      const responsePayload = {
        status: 200,
        message: null,
        data: null,
        error: "User cannot logout.",
      };
      return res.status(200).json(responsePayload);
    } else {
      // Clear cookies and send a successful logout response
      const cookieOptions = {
        httpOnly: true,
        secure: true, // Ensure secure cookies in production
        sameSite: "strict" as const, // Add `sameSite` for CSRF protection
      };

      const responsePayload = {
        status: 200,
        message: "User logged out successfully.",
        data: null,
        error: null,
      };

      return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(responsePayload);
    }
  }
);

//POST => Generate the AccessToken
export const generateAccessToken = asyncHandler(
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const incomingRefreshToken: string | undefined =
      req.cookies?.refreshToken || req.body.refreshToken;

    // Check if the refresh token exists
    if (!incomingRefreshToken) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Please enter the refresh token.",
      };
      return res.status(401).json(responsePayload);
    }

    // Get the secret key from the environment
    const secretKey: string | undefined = process.env.ACCESS_TOKEN;
    if (!secretKey) {
      throw new Error("ACCESS_TOKEN environment variable is not set");
    }

    // Verify the refresh token
    let verifiedToken: JwtPayload;
    try {
      verifiedToken = jwt.verify(incomingRefreshToken, secretKey) as JwtPayload;
    } catch (error) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Invalid or expired refresh token.",
      };
      return res.status(401).json(responsePayload);
    }

    // Validate the user ID from the decoded token
    const user = await User.findById(verifiedToken?.userId);
    if (!user) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "User not found. Please enter a valid refresh token.",
      };
      return res.status(401).json(responsePayload);
    }

    // Compare the incoming refresh token with the one stored in the database
    if (incomingRefreshToken !== user.refreshToken) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Refresh token is expired or does not match.",
      };
      return res.status(401).json(responsePayload);
    }

    // Generate a new access token and refresh token
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true, // Use HTTPS in production
    };

    const responsePayload = {
      status: 200,
      message: "Refresh token generated successfully.",
      data: { accessToken, refreshToken },
      error: null,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(responsePayload);
  }
);

//POST => Allow the user to change password
export const changePassword = asyncHandler(
  async (
    req: express.Request<{}, {}, ChangePasswordBody>,
    res: express.Response
  ): Promise<express.Response> => {
    const { oldPassword, newPassword } = req.body;
    //Check whether use exist or not
    const user = await User.findById(req.user?.userId);
    if (!user) {
      const responsePayload = {
        status: 404,
        message: null,
        data: null,
        error: "User not found.",
      };
      return res.status(404).json(responsePayload);
    }
    //Compare the password
    const passwordCheck = await user.comparePassword(oldPassword);
    if (passwordCheck) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Please enter the valid password.",
      };
      return res.status(401).json(responsePayload);
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    const responsePayload = {
      status: 200,
      message: "Password has been updated successfully.",
      data: null,
      error: null,
    };
    return res.status(200).json(responsePayload);
  }
);
//POST => Forgot Password
export const forgotPassword = asyncHandler(
  async (
    req: express.Request<{}, {}, ForgotPasswordBody>,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { email } = req.body;
    const userFound = await User.findOne({ email: email });
    if (!userFound) {
      const responsePayload = {
        status: 404,
        message: null,
        data: null,
        error: "No user found with the given email",
      };
      return res.status(404).json(responsePayload);
    }
    //Generate token for forgot password
    const token = crypto.randomBytes(32).toString("hex");
    const date = Date.now() + 3600000;
    await User.findByIdAndDelete(userFound?._id, {
      $set: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: date,
      },
    });
    //Send the mail
    await forgotPasswordMail(token, userFound?.email);
    const responsePayload = {
      status: 200,
      message: "Reset password mail has been send successfully.",
      data: null,
      error: null,
    };
    return res.status(404).json(responsePayload);
  }
);

//POST => Reset password
export const resetPassword = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { token, password }: { token: string; password: string } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      const responsePayload = {
        status: 400,
        message: null,
        data: null,
        error: "The token has been expired or please enter the valid token",
      };
      return res.status(400).json(responsePayload);
    }
    //Update the password
    user.password = password;
    user.resetPasswordToken = "";
    user.resetPasswordTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    const responsePayload = {
      status: 200,
      message: "The user has reset the password successfully.",
      data: null,
      error: null,
    };
    return res.status(200).json(responsePayload);
  }
);

//POST => Email verification
export const userEmailVerification = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const { token }: { token: string } = req.body;
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(200).json({
        status: 400,
        message: null,
        data: null,
        error: "Sorry, the given token is expired or invalid.",
      });
    }
    //Update the details
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: 200,
      message: "Email verified successfully.",
      data: null,
      error: null,
    });
  }
);
