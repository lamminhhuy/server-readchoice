const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  googleBooksId: {type: String, required: true},
  title: { type: String, required: true },
  author: { type: String },
  isbn: { type: String, required: true },
  publicationDate: { type: Date },
  genre: [{ type: String }],
  description: { type: String },
  coverImage: { type: String },
  reviewsCount: {type:Number, default:0},
  ratingsCount: {type:Number,default:0},
  averageRating: { type: Number, default: 0.0 },
  downloadLink: {type: String},
  buyLink: {type: String}
});



const Book = mongoose.model('book', bookSchema);

module.exports = Book;