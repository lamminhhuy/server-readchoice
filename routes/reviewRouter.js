const reviewCtrl  = require('../controllers/reviewCtrl')
const router = require('express').Router()
router.post('/books/review/:userId/:bookId',reviewCtrl.createReview)
router.get('/books/reviews/:bookId',reviewCtrl.getReviews)
router.delete('/:bookId/reviews/:reviewId/comments/:commentId/unlike',reviewCtrl.unlikeReviews)
router.put('/books/review/like/:user_id/:id',reviewCtrl.likeReviews)
router.post('/books/review/comment/:user_id/:id', reviewCtrl.commentReviews)
module.exports =router