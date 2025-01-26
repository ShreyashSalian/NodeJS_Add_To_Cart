import express from "express";
import {
  asyncHandler,
  CustomerAddressBody,
  ReturnResponseBody,
} from "../utils/fuction";
import { CustomAddress } from "../models/customerAddress.model";

//POST => Used to add the address of the customer
export const addCustomerAddress = asyncHandler(
  async (
    req: express.Request<{}, {}, CustomerAddressBody>,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const {
      addressLine1,
      addressLine2,
      landMark,
      specialInstruction,
      city,
      state,
      postalCode,
      country,
      addressType,
    } = req.body;
    const addressCreation = await CustomAddress.create({
      user: req.user?.userId,
      addressLine1,
      addressLine2,
      landMark,
      specialInstruction,
      city,
      state,
      postalCode,
      country,
      addressType,
    });
    if (addressCreation) {
      return res.status(200).json({
        status: 200,
        message: "Address has been added successfully.",
        data: addressCreation,
        error: null,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: null,
        data: null,
        error: "Sorry, the address can not be added.",
      });
    }
  }
);

//PUT=> Used to update the customer address details
export const updateAddress = asyncHandler(
  async (
    req: express.Request<{}, {}, CustomerAddressBody>,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const {
      addressLine1,
      addressLine2,
      landMark,
      specialInstruction,
      city,
      state,
      postalCode,
      country,
      addressType,
    } = req.body;
    const updateAddressDetail = await CustomAddress.findOneAndUpdate(
      { user: req.user?.userId },
      {
        $set: {
          addressLine1,
          addressLine2,
          landMark,
          specialInstruction,
          city,
          state,
          postalCode,
          country,
          addressType,
        },
      },
      {
        new: true,
      }
    );
    if (updateAddressDetail) {
      return res.status(200).json({
        status: 200,
        message: "The Address has been updated successfully.",
        data: updateAddressDetail,
        error: null,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: null,
        data: null,
        error: "Sorry, the address can not be updated.",
      });
    }
  }
);

//GET => Used to get the customer detail
export const getCustomerAddress = asyncHandler(
  async (
    req: express.Request,
    res: express.Response<ReturnResponseBody>
  ): Promise<express.Response> => {
    const customerAddress = await CustomAddress.findOne({
      user: req.user?.userId,
    });
    if (customerAddress) {
      return res.status(200).json({
        status: 200,
        message: "The customer address details",
        data: customerAddress,
        error: null,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: null,
        data: null,
        error: "Sorry, no address has been added.",
      });
    }
  }
);
