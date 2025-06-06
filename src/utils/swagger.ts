export const swaggersDocuments = {
  openapi: "3.0.0",
  info: {
    title: "Online Shopping API",
    version: "1.0.0",
    description:
      "This is the swagger documentation for the SHREYASH PROJECT API.",
  },
  servers: [
    {
      url: "http://localhost:8000/",
      description: "This is the staging server.",
    },
    {
      url: "http://localhost:8000/",
      description: "This is the live server.",
    },
  ],

  tags: [
    {
      name: "User",
      description: "The users collection.",
    },
    {
      name: "Cart",
      description: "The cart model description.",
    },
    {
      name: "Category",
      description: "The category model description.",
    },
    {
      name: "CustomerAddress",
      description: "The customerAddress model description.",
    },
    {
      name: "login",
      description: "The login model description",
    },
    {
      name: "Order",
      description: "The order model description.",
    },
    {
      name: "Product",
      description: "The product model descriptions.",
    },
    {
      name: "Rating",
      description: "The rating model descriptions.",
    },

    {},
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: {
            type: "integer",
            description: "This field is auto generated by mongoDB.",
          },

          email: {
            type: "string",
            description: "This field store's the email of the user.",
            example: "xyz@gmail.com",
          },
          fullName: {
            type: "string",
            description: "This field store's the full name.",
            example: "xyz xyz",
          },
          password: {
            type: "string",
            description: "This field store's the password of the user.",
            example: "Xyz@123456",
          },
          role: {
            type: "string",
            description:
              "This field store's the role of the person whether it is admin or employee",
            example: "admin",
          },
          isDeleted: {
            type: "boolean",
            description:
              "This field status of the employee whether he has resigned or has been removed",
            example: "admin",
          },

          refreshToken: {
            type: "string",
            description: "This field store's the login token of the user.",
          },
          resetPasswordToken: {
            type: "string",
            description:
              "This field stores the reset password token of the user.",
          },
          resetPasswordTokenExpiry: {
            type: "string",
            format: "date",
            description:
              "This field store's the reset password expiry time details.",
          },
          isEmailVerified: {
            type: "boolean",
            description:
              "This field store the status whether the user is verified or not.",
          },
          emailVerificationToken: {
            type: "string",
            description: "This field store the email verification token.",
          },
          profileImage: {
            type: "string",
            description: "This field store the profile image of user.",
          },

          created_at: {
            type: "string",
            format: "date",
            description: "This field store the creation time details.",
          },
          updated_at: {
            type: "string",
            format: "date",
            description: "The field store the update time details.",
          },
        },
      },
      Login: {
        type: "object",
        properties: {
          _id: {
            type: "integer",
            description: "This field is auto generated by mongoDB.",
          },
          userId: {
            type: "string",
            description: "This field store's the user id for reference.",
            example: "123567885fgfg",
          },
          email: {
            type: "string",
            description: "This field store's the email of the user.",
            example: "xyz@gmail.com",
          },
          token: {
            type: "string",
            description: "This field store's the login token of the user.",
          },
          refreshToken: {
            type: "string",
            description:
              "This field stores the reset password token of the user.",
          },
          createdAt: {
            type: "string",
            format: "date",
            description: "This field store the creation time details.",
          },
          updatedAt: {
            type: "string",
            format: "date",
            description: "The field store the update time details.",
          },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: {
            type: "integer",
            description: "This field is auto generated by mongoDB.",
          },
          categoryName: {
            type: "string",
            description: "This field store the category Name",
            example: "xyz xyz",
          },
          categoryDescription: {
            type: "string",
            description: "This field store the category description.",
          },
          categorySlug: {
            type: "string",
            description: "This field store slug of the category.",
          },
          categoryImage: {
            type: "string",
            description: "This field stores the category image",
          },
          status: {
            type: "string",

            description: "This field store the status of the category.",
            example: "active/inactive",
          },
          keywords: {
            type: "string",
            description: "This field store keyword for the category",
          },
          isFeatured: {
            type: "string",
            format: "boolean",
            description: "Stores whether the category is featured or not.",
          },
          isDeleted: {
            type: "string",
            format: "boolean",
            description: "Stores whether the category is deleted or not.",
          },
          createdAt: {
            type: "string",
            format: "date",
            description: "This field store the creation time details.",
          },
          updatedAt: {
            type: "string",
            format: "date",
            description: "The field store the update time details.",
          },
        },
      },
      CustomerAddress: {
        type: "object",
        properties: {
          _id: {
            type: "integer",
            description: "This field is auto generated by mongoDB.",
          },
          user: {
            type: "string",
            description: "This field store's the user id for reference.",
            example: "675fc1a148f59a2cd688d9a6",
          },
          addressLine1: {
            type: "string",
            description: "This field store address of the user.",
          },
          addressLine2: {
            type: "string",
            description:
              "This field store address of the user and it is not compulsory.",
          },
          landMark: {
            type: "string",
            description:
              "This field store the landmark of the user and it is not compulsory.",
          },
          specialInstruction: {
            type: "string",
            description:
              "This field store the special instruction of the user and it is not compulsory.",
          },
          city: {
            type: "string",
            description: "This field store the city of the user.",
          },
          state: {
            type: "string",
            description: "This field store the state of the user.",
          },
          postalCode: {
            type: "string",
            description: "This field store the postal code of the user.",
          },
          country: {
            type: "string",
            description: "This field store the country of the user.",
          },

          addressType: {
            type: "string",
            description: "This field store the addressType of the user.",
            example: "home/office",
          },

          // subCommentsIds: [
          //   {
          //     type: "string",
          //     description: "This field stores the subcomments ID.",
          //     example: "123456789",
          //   },
          // ],
          isDeleted: {
            type: "boolean",
            description: "This field store whether the task is deleted or not",
            example: "2020-10-10",
          },
          created_at: {
            type: "string",
            format: "date",
            description: "This field store the creation time details.",
          },
          updated_at: {
            type: "string",
            format: "date",
            description: "The field store the update time details.",
          },
        },
      },

      Error: {
        type: "object", //data type
        properties: {
          message: {
            type: "string", // data type
            description: "Error message", // desc
            example: "Not found", // example of an error message
          },
          internal_code: {
            type: "string", // data type
            description: "Error internal code", // desc
            example: "Invalid parameters", // example of an error internal code
          },
        },
      },
    },
    securitySchemes: {
      JWT: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
  },
  paths: {
    "/api/v1/auth/login": {
      post: {
        tags: ["Users"],
        consumes: {},
        summary: "Allow the admin to login.",
        description: "Allow the admin to login.",
        // security: [
        //   {
        //     JWT: [],
        //   },
        // ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    example: "abc@gmail.com",
                  },
                  password: {
                    type: "string",
                    example: "abc@123",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  items: {
                    type: "string",
                  },
                },
              },
            },
          },
          401: {
            description: "UnAuthorized error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  items: {
                    message: "Please enter the valid email and password.",
                  },
                },
              },
            },
          },
          500: {
            description: "forbidden error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  items: {
                    message: "Sorry there is some error",
                  },
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
          },
        },
      },
    },
    "/api/v1/auth/logout": {
      get: {
        tags: ["Users"],
        consumes: {},
        summary: "Allow the admin to logout.",
        description: "Allow the admin to logout.",
        security: [
          {
            JWT: [],
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  items: {
                    type: "string",
                  },
                },
              },
            },
          },
          401: {
            description: "UnAuthorized error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  items: {
                    message: "Please enter the valid email and password.",
                  },
                },
              },
            },
          },
          500: {
            description: "forbidden error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  items: {
                    message: "Sorry there is some error",
                  },
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
          },
        },
      },
    },
    "/api/v1/users/forgot-password": {
      post: {
        tags: ["Users"],
        summary: "The reset password link will be send to the given mail.",
        description: "The reset password link will be send to the given mail",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    example: "abc@gmail.com",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  items: {
                    type: "string",
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  items: {
                    message: "Internal server error",
                  },
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
          },
        },
      },
    },
  },
};
