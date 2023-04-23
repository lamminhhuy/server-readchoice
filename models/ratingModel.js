const mongoose = require('mongoose');
const Book = require('./bookModel');

const RatingSchema = new mongoose.Schema({
  
  rating: { type: Number, required: true, min: 1, max: 5 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

RatingSchema.pre('save', async function (next) {
  const ratingSchema = this;
  try {
    const book = await Book.findById(ratingSchema.book);
    book.ratingNum += 1
    if (book.averageRating >=1)
    {
   book.averageRating = (book.averageRating + ratingSchema.rating)/2
    }else {
      
   book.averageRating = (1 + ratingSchema.rating)/2
    }
 await book.save();
    next();
  } catch (err) {
    next(err);
  }
}); 
const Rating = mongoose.model('Rating', RatingSchema);

module.exports = Rating;
