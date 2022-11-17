import express from "express";
import PostService from "../services/postService";
import newPostValidation from "../middleware/addPostValidator";
import newCommentValidation from "../middleware/addCommentValidator";

const router = express.Router();

router
  .get("/overview", PostService.getOverview) // posts made by my followed users
  .get("/recommend", PostService.recommend) // posts made by followed users followed users
  .post("/comments/:id", newCommentValidation, PostService.addComment) // add comment
  .post("/like/:id", PostService.addLike) // add like
  .delete("/like/:id", PostService.removeLike) // unlike
  .post("/", newPostValidation, PostService.addPost) // add post with media
  .get("/user/:id", PostService.userPosts) // single user posts
  .get("/:id", PostService.getPost) // one post
  .delete("/:id", PostService.deletePost); // delete post

export default module.exports = router;
