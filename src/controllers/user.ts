import express from 'express'
import UserService from '../services/userService'
import newUserValidation from '../middleware/createUserValidator'
import userUpdateValidation from '../middleware/updateUserValidator'

const router = express.Router()

router
  // .get("/passwords", UserService.setPasswords)
  .post('/login', UserService.login)
  .get('/profile/:id', UserService.getProfile)
  .post('/follow/:id', UserService.follow)
  .delete('/follow/:id', UserService.unFollow)
  .get('/:id', UserService.getUser)
  .put('/:id', userUpdateValidation, UserService.updateUser)
  .delete('/:id', UserService.deleteUser)
  .post('/', newUserValidation, UserService.addUser)
  .get('/', UserService.getUsers)

export default module.exports = router
