import { checkSchema } from "express-validator";
import { capitalizeFirstLetter, toCapitalCase } from "../utils/fuction";

export const customerAddressValidation = () => {
  return checkSchema({
    addressLine1: {
      notEmpty: {
        errorMessage: "Please enter the address detail.",
      },
      customSanitizer: {
        options: (value: string) => toCapitalCase(value),
      },
    },
    city: {
      notEmpty: {
        errorMessage: "Please enter the city.",
      },
      customSanitizer: {
        options: (value: string) => capitalizeFirstLetter(value),
      },
    },
    state: {
      notEmpty: {
        errorMessage: "Please enter the state.",
      },
      customSanitizer: {
        options: (value: string) => capitalizeFirstLetter(value),
      },
    },
    postalCode: {
      notEmpty: {
        errorMessage: "Please enter the postal code.",
      },
    },
    country: {
      notEmpty: {
        errorMessage: "Please enter the country.",
      },
      customSanitizer: {
        options: (value: string) => capitalizeFirstLetter(value),
      },
    },
    addressType: {
      notEmpty: {
        errorMessage: "Please select the address type.",
      },
    },
  });
};
