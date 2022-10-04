import { checkSchema } from "express-validator";

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

export default newUserValidation;
