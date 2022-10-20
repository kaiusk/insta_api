import { NextFunction, Request, Response } from "express";

/**
 * Middleware to check if user has certain roles.
 * @param req
 * @param res
 * @param next
 */
const isOwner = (req: Request, res: Response, next: NextFunction): void => {
  if (req.auth?.data?.Role || req.params.id === req.auth.data.ID) next();
  else res.sendStatus(401);
};

export default isOwner;
