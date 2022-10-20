import express from "express";
import StatService from "../services/statService";
import isAdmin from "../middleware/isAdmin";

const router = express.Router();

router
  .get("/topusers", isAdmin, StatService.getTopUsers)
  .get("/genders", isAdmin, StatService.getGenders)
  .get("/users", isAdmin, StatService.getUsersAdded)
  .get("/", isAdmin, StatService.getStats);

export default module.exports = router;
