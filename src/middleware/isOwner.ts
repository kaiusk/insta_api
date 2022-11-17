import { NextFunction, Response } from "express";
import { Request } from "express-jwt";

/**
 * Middleware to check if user has certain roles.
 * @param req
 * @param res
 * @param next
 */
const isOwner = (req: Request, res: Response, next: NextFunction): void => {
  if (
    req.auth?.data?.role ||
    parseInt(req.params.id) === parseInt(req.auth?.data.id)
  )
    next();
  else res.sendStatus(401);
};

export default isOwner;
