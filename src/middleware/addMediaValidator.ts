import { checkSchema } from "express-validator";

const newMediaValidation = checkSchema({
  fileTypeID: {
    errorMessage: "media type is wrong",
    toInt: true,
    isInt: {
      options: { min: 1, max: 2 },
    },
  },
  fileUrl: {
    errorMessage: "media url is wrong",
    isURL: true,
  },
});

export default newMediaValidation;
