import { TokenPayload } from "..";

declare global {
  declare module "express-serve-static-core" {
    interface Request {
      user?: TokenPayload;
    }
  }
}
