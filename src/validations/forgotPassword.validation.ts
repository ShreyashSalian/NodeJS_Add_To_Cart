import { checkSchema } from "express-validator";
import { trimInput } from "../utils/fuction";

export const forgotPasswordValidation = () => {
  return checkSchema({
    email: {
      notEmpty: {
        errorMessage: "Please enter the email.",
      },
      isEmail: {
        errorMessage: "Please enter a valid email.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
