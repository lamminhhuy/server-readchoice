const Book = require('../models/bookModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const bookCtrl = {
   postBook: async (req, res) => {
     try {
       const { title, author, isbn, publicationDate, genre, description, coverImage, rating, review, status, series, seriesNumber } = req.body;

       const existingBook = await Book.findOne({ isbn });
       if (existingBook) {
         return res.status(400).json({msg:'This book already exists in the database!'});
       }
 
       const book = new Book({
         title,
         author,
         isbn,
         publicationDate,
         genre,
         description,
         coverImage,
  reviewNum:0,
  ratingNum:0,
  averageRating:0.0,
       });
       await book.save();
       return res.status(200).json({msg:'Book added successfully!'});
     } catch (err) {
       return res.status(500).json({msg:err.message});
     }
   },
   getbooks: async (req, res) => {
    try {
      const books = await Book.find();
      if (books.length === 0) {
        return res.status(404).json({ message: 'No books found' });
      }
      res.json(books);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
 },
 getabook: async (req, res) => {
 try {
 let book = await Book.findOne({ googleBooksId: req.params.id });
 if (!book) {
const response= await axios.get(`https://www.googleapis.com/books/v1/volumes/${req.params.id}?key=AIzaSyC1QE3wf2PHJeyxKkri7C3d68OC5379ksg`);

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
await book.save();

 return res.json(book);
 }
 return res.json(book);
 } catch (err) {
 console.error(err);
 res.status(500).json({ message: err.message });
 }
 },
findabook: async (req, res) => {
  try {
     const keyword = req.params.keyword;
    const regex = keyword
    ? {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { author: { $regex: keyword, $options: 'i' } },
        ],
      }
    : {};
  const books = await Book.find(regex); // sử dụng regex trực tiếp ở đây
     if (books.length === 0) {
      return res.status(404).json({ msg: 'Không tìm thấy sách nào' });
    }
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

}
 module.exports = bookCtrl;
