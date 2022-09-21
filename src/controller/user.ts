import express from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { checkSchema, validationResult } from "express-validator";
import { MIUser } from "../model/mi-user";

const router = express.Router();

// mock data
const users: MIUser[] = [
  {
    id: 0,
    username: "juhan",
    name: "Juhan Juurikas",
    genderId: 1,
    bio: "",
  },
];

const newUserValidation = checkSchema({
  genderId: {
    // The location of the field, can be one or more of body, cookies, headers, params or query.
    // If omitted, all request locations will be checked
    //in: ["body", "query"],
    errorMessage: "gender is wrong",
    isInt: true,
    // Sanitizers can go here as well
    toInt: true,
  },
  password: {
    isLength: {
      errorMessage: "Password should be at least 7 chars long",
      // Multiple options would be expressed as an array
      options: { min: 7 },
    },
  },
  name: {
    isUppercase: {
      // To negate a validator
      negated: true,
    },
    isLength: {
      errorMessage: "Name should be at least 3 chars long",
      options: { min: 3 },
    },
  },
  username: {
    isLength: {
      errorMessage: "Username should be at least 5 chars long",
      options: { min: 5 },
    },
  },
  // Support bail functionality in schemas
  email: {
    isEmail: {
      bail: true,
    },
  },
});
const userUpdateValidation = checkSchema({
  genderId: {
    // The location of the field, can be one or more of body, cookies, headers, params or query.
    // If omitted, all request locations will be checked
    //in: ["body", "query"],
    errorMessage: "gender is wrong",
    isInt: true,
    // Sanitizers can go here as well
    toInt: true,
    optional: true,
  },
  password: {
    isLength: {
      errorMessage: "Password should be at least 7 chars long",
      // Multiple options would be expressed as an array
      options: { min: 7 },
    },
    optional: true,
  },
  name: {
    isUppercase: {
      // To negate a validator
      negated: true,
    },
    isLength: {
      errorMessage: "Name should be at least 3 chars long",
      options: { min: 3 },
    },
    optional: true,
  },
  username: {
    isLength: {
      errorMessage: "Username should be at least 5 chars long",
      options: { min: 5 },
    },
    optional: true,
  },
  // Support bail functionality in schemas
  email: {
    isEmail: {
      bail: true,
    },
    optional: true,
  },
  website: {
    isURL: {
      bail: true,
    },
    optional: true,
  },
  profileImageUrl: {
    isURL: {
      bail: true,
    },
    optional: true,
  },
  bio: {
    isString: {
      bail: true,
    },
    optional: true,
  },
});

router
  .get("/", (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
      success: true,
      message: "List of users",
      users,
    });
  })
  .get("/:id", (req: Request, res: Response) => {
    const uid = users.findIndex((u) => u.id === +req.params.id);
    if (uid === -1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `User not found`,
      });
    }
    return res.status(StatusCodes.OK).json(users[uid]);
  })
  .post("/", newUserValidation, (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { username, name, email, password, genderId } = req.body;
    const id = users.length + 1;
    const newUser: MIUser = {
      bio: "",
      genderId,
      id,
      username,
      name,
      email,
      password,
    };
    users.push(newUser);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: `User with id ${newUser.id} created`,
    });
  })
  .put("/:id", userUpdateValidation, (req: Request, res: Response) => {
    const uid = users.findIndex((u) => u.id === +req.params.id);
    if (uid === -1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `User not found`,
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    users[uid] = Object.assign(users[uid], req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: `User with id ${req.params.id} updated`,
    });
  })
  .delete("/:id", (req: Request, res: Response) => {
    const uid = +req.params.id;
    const index = users.findIndex(({ id }) => id === uid);
    if (index === 1) {
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
