import express from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IUser } from "../model/iuser";

const router = express.Router();

const users: IUser[] = [
  {
    id: 1,
    firstName: "Juhan",
    lastName: "Juurikas",
    email: "juhan@juurikas.ee",
    password: "string",
  },
];

router
  .get("/", (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
      success: true,
      message: "List of users",
      users,
    });
  })
  .post("/", (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;
    const id = users.length + 1;
    //todo validate
    const newUser: IUser = {
      id,
      firstName,
      lastName,
      email,
      password,
    };
    users.push(newUser);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: `User with email ${newUser.id} created`,
    });
  })
  .put("/:id", (req: Request, res: Response) => {
    // todo update
  });

router.delete("/:id", (req: Request, res: Response) => {
  const uid = parseInt(req.params.id);
  const index = users.findIndex(({ id }) => id === uid);
  if (!index) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `User not found`,
    });
  }
  users.splice(index, 1);
  res.status(StatusCodes.OK).json({
    success: true,
    message: `User deleted`,
  });
});

module.exports = router;
