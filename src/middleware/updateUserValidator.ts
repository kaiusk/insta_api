import { checkSchema } from "express-validator";

export function userUpdateValidation() {
  checkSchema({
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
}
