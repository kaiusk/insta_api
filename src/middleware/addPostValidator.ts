import { checkSchema } from 'express-validator'

const newPostValidation = checkSchema({
  location: {
    isLatLong: true,
    optional: true
  },
  locationName: {
    isLength: {
      errorMessage: 'Location name should be at least 3 chars long',
      options: { min: 3 }
    },
    optional: true
  }
})

export default newPostValidation
