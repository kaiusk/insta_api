import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const AuthErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === "UnauthorizedError") {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "unauthorized" });
  } else {
    next(err);
  }
};
export default AuthErrorHandler;
