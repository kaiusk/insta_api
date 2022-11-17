import express from "express";
import UserService from "../services/userService";
import newUserValidation from "../middleware/createUserValidator";
import userUpdateValidation from "../middleware/updateUserValidator";
import isOwner from "../middleware/isOwner";
// import isAdmin from "../middleware/isAdmin";

const router = express.Router();

router
  .post("/login", UserService.login)
  .get("/profile/:id", UserService.userProfile)
  .post("/follow/:id", UserService.follow)
  .delete("/follow/:id", UserService.unFollow)
  .get("/:id", UserService.getUser)
  .put("/:id", isOwner, userUpdateValidation, UserService.updateUser)
  .delete("/:id", isOwner, UserService.deleteUser)
  .post("/", newUserValidation, UserService.addUser);
// .get("/", isAdmin, UserService.getUsers);

export default module.exports = router;
