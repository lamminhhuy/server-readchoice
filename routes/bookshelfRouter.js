const router = require('express').Router()
const BookshelfCtrl =  require('../controllers/BookshelfCtrl')
const {auth} = require('../middleware/auth')
router.post('/bookshelf/books',auth, BookshelfCtrl.addtobookshelf) 

router.get('/bookshelf/books/:userId', BookshelfCtrl.getbookshelf) 
module.exports = router