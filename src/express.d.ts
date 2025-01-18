import { User } from "./models/user.model";

// import express from "express";

// declare global {
//   namespace Express {
//     interface Request {
//       files?: {
//         [fieldname: string]: Express.Multer.File[];
//       };
//     }
//   }
// }
interface userDetails {
  userId: string;
  email: string;
  token: string;
}

import * as express from "express-serve-static-core";
declare global {
  namespace Express {
    interface Request {
      user?: userdetails;
    }
  }
}
