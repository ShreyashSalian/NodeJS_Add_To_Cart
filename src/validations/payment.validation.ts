import { checkSchema } from "express-validator";
import { trimInput } from "../utils/fuction";

export const paymentValidation = () => {
  return checkSchema({
    amount: {
      notEmpty: {
        errorMessage: "Please enter the amount",
      },
    },
    currency: {
      notEmpty: {
        errorMessage: "Please select the curreny",
      },
    },
  });
};
