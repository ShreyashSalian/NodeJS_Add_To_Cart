import { checkSchema } from "express-validator";

export const orderValidation = () => {
  return checkSchema({
    uniqueId: {
      notEmpty: {
        errorMessage: "Please enter the unique ID.",
      },
    },
  });
};
