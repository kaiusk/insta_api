import express from "express";
import UserService from "../service/UserService";
import { newUserValidation } from "../middleware/createUserValidator";
import { userUpdateValidation } from "../middleware/updateUserValidator";

const router = express.Router();

router
  .get("/", UserService.getUsers)
  //.get("/passwords", UserService.setPasswords)
  .post("/login", UserService.login)
  .get("/:id", UserService.getUser)
  .post("/", newUserValidation, UserService.addUser)
  .put("/:id", userUpdateValidation, UserService.updateUser)
  .delete("/:id", UserService.deleteUser)
  .post("/follow/:id", UserService.follow)
  .get("/posts/:id", UserService.getPosts);

export default module.exports = router;
