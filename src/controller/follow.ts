import express from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
//import { checkSchema, validationResult } from "express-validator";
//import { MIUser } from "../model/mi-user";
//import { Password } from "../service/Password";

const router = express.Router();

router.post("/follow", (req: Request, res: Response) => {
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "followee added",
  });
});
