import "i18n";
import { Response } from "express";

declare module "express" {
  export interface Response {
    __: (phrase: string, ...replace: any[]) => string;
  }
}
