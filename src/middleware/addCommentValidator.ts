import { checkSchema } from 'express-validator'

const newCommentValidation = checkSchema({
  comment: {
    isString: true,
    isLength: {
      errorMessage: 'comment should be at least 2 chars long',
      options: { min: 2 }
    }
  }
})

export default newCommentValidation
