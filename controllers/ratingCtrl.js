const {  mongoose } = require('mongoose');
const Post = require('../models/postModel');
const Rating = require('../models/ratingModel');
const Book = require('../models/bookModel');
const axios = require('axios');
const postModel = require('../models/postModel');
const ratingCtrl = {

    createRating: async (req,res) => {
      
  try {
    const bookId = req.params.bookId;
    const { rating } = req.body;
    const author = req.user._id;

    // Find the book by id
    let book = await Book.findById(bookId);

    // If the book doesn't exist, return an error
    if (!book) {
      const response= await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=AIzaSyC1QE3wf2PHJeyxKkri7C3d68OC5379ksg`);
      const bookdata = response.data
        book = new Book({
          googleBooksId: bookdata.id,
          title: bookdata.volumeInfo.title,
          author: bookdata.volumeInfo.authors ? bookdata.volumeInfo.authors.join(', ') : 'N/A',
          publicationDate: bookdata.volumeInfo.publishedDate,
          isbn: bookdata.volumeInfo.industryIdentifiers ? bookdata.volumeInfo.industryIdentifiers[0].identifier : 'N/A',
          description: bookdata.volumeInfo.description ? bookdata.volumeInfo.description : "" ,
          genre: bookdata.volumeInfo.categories ? bookdata.volumeInfo.categories.join(', ') : 'N/A',
          coverImage: bookdata.volumeInfo.imageLinks && bookdata.volumeInfo.imageLinks.thumbnail ,
          downloadLink: bookdata.accessInfo.epub.acsTokenLink?  bookdata.accessInfo.epub.acsTokenLink : "" ,
          buyLink: bookdata.saleInfo.buyLink ? bookdata.saleInfo.buyLink: "",
          averageRating:bookdata.volumeInfo.averageRating,
          ratingsCount:bookdata.volumeInfo.ratingsCount  
       });
       const savedBook = await book.save();
    }
    // Create a new rating
    const newRating = new Rating({
      rating: rating,
      author: author,
      book: book._id
    });
    // Update the book's rating statistics
    book.ratingsCount++;
    book.averageRating =
      (book.averageRating * (book.ratingsCount - 1) + rating) / book.ratingsCount;
    // Save the new rating and the updated book
    await newRating.save();
    await book.save();
   const post = new postModel({
    status: "rated a book"+ rating,
    book: book._id,
 user: req.user._id
   })
   await post.save()
    // Return the new rating
    res.status(201).json(newRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
    },
    
    getRatings: async (req,res) => {
      
        try {
            const rating = await Rating.find({ author: req.params.user_id });
            if (!rating) {
              return res.json({ msg: "User chưa đánh giá" });
            }
            return res.status(200).json(rating);
          } catch (error) {
            return res.status(500).json(error);
          }
        }
}
module.exports =ratingCtrl