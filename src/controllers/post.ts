import express from 'express'
import PostService from '../services/postService'
import newPostValidation from '../middleware/addPostValidator'
import newMediaValidation from '../middleware/addMediaValidator'
import newCommentValidation from '../middleware/addCommentValidator'

const router = express.Router()

router
  .get('/:id', PostService.getPost)
  .get('/overview/:id', PostService.getOverview)
  .get('/media/:id', PostService.getMedia)
  .get('/comments/:id', PostService.getComments)
  .get('/recommend/:id', PostService.recommend)
  .post('/comments:id', newCommentValidation, PostService.addComment)
  .post('/like/:id', PostService.addLike)
  .delete('/like/:id', PostService.removeLike)
  .post('/media/:id', newMediaValidation, PostService.addMedia)
  .post('/', newPostValidation, PostService.addPost)
  .delete('/:id', PostService.deletePost)

export default module.exports = router
