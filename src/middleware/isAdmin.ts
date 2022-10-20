import { NextFunction, Request, Response } from "express";

/**
 * Middleware to check if user has certain roles.
 * @param req
 * @param res
 * @param next
 */
const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.auth?.data.Role) res.sendStatus(401);
  else next();
};

export default isAdmin;
