import { NextFunction, Response } from "express";
import { Request } from "express-jwt";

/**
 * Middleware to check if user has certain roles.
 * @param req
 * @param res
 * @param next
 */
const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.auth?.data.role) res.sendStatus(401);
  else next();
};

export default isAdmin;
