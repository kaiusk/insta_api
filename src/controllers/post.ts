import express from "express";
import PostService from "../services/PostService";

const router = express.Router();

router
  .get("/:id", PostService.getPost)
  .get("/overview/:id", PostService.getOverview)
  .get("/header/:id", PostService.getHeader)
  .get("/comments/:id", PostService.getComments)
  .post("/comments:id", PostService.addComment)
  .post("/like/:id", PostService.addLike)
  .post("/media/:id", PostService.addMedia)
  .post("/", PostService.addPost)
  .delete("/:id", PostService.deletePost);

export default module.exports = router;
