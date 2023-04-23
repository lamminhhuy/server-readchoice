const mongoose   = require('mongoose')

const recommendedBook = new mongoose.Schema({
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'book'
      }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})
const RecommendedBook = mongoose.model('recommendedbook', recommendedBook)
module.exports = RecommendedBook;