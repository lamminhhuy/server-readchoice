
const router = require('express').Router ()
const ratingCtrl = require('../controllers/ratingCtrl')
const { auth } = require('../middleware/auth')
router.post('/books/rating/:bookId',auth,ratingCtrl.createRating)
router.get('/books/rating/:bookId',auth,ratingCtrl.getRatings)
module.exports =router