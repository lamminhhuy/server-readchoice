const Book = require('../models/bookModel');
const Bookshelf = require('../models/Bookshelf_Books');
const mongoose = require('mongoose');

const Post = require('../models/postModel');
const User = require('../models/userModel'); 
const axios = require('axios')
const BookshelfCtrl = {
  addtobookshelf: async (req, res) => { 
    
  try {
    // Extract request body
    const { drawerName, userId, book } = req.body;
   
    const missingFields = [];
    if (!drawerName) {
      missingFields.push('drawerName');
    }
    if (!userId) {
      missingFields.push('userId');
    }
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }
  
    let findBook = await Book.findOne({title:book.title})
    if(!findBook)
    {
         findBook = new Book({
          googleBooksId: book.bookId,
               title: book.title,
               author: book.author_name,
               isbn: book.isbn,
               publicationDate: book.publish_date,
               genre: book.genre,
               description: book.description,
               coverImage: book.cover_i,
        })
      await  findBook.save()
    }
    // Verify that drawer name, user ID, and book ID are provided
    // Check if bookshelf exists; if not, create a new one
    let bookshelf = await Bookshelf.findOne({ user: userId });
    if (!bookshelf) {
      // Verify that user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Create new bookshelf document
      const newBookshelf = new Bookshelf({ user: userId, drawers: [{ name: drawerName, books: [findBook._id] }] });
      await newBookshelf.save();

      const post = new Post({
        status: drawerName && drawerName == "Read" ? "finished reading" :drawerName,
        book: findBook._id,
        user: userId
      });
  await post.save();
      // Set bookshelf variable to newly created bookshelf
      bookshelf = newBookshelf;
    } else {
      const existingDrawer = bookshelf.drawers.find(drawer => drawer.name === drawerName);
      if (existingDrawer) {
      const existingBook = existingDrawer.books.includes( findBook._id);
      if(!existingBook)
      {
        existingDrawer.books.push(findBook._id);
        const post = new Post({
          status: drawerName && drawerName == "Read" ? "finished reading" :drawerName,
          book: findBook._id,
          user: userId
        });
        await post.save();
      }  else  {
        return   res.status(400).json({ message: 'Book already added to the bookshelf' });
      }
      } else {
        
        bookshelf.drawers.push({name: drawerName, books: [findBook._id]});
  
        const post = new Post({
          status: drawerName && drawerName == "Read" ? "finished reading" :drawerName,
          book: findBook._id,
          user: userId
        });
    await post.save();
      }
    }
    await bookshelf.save();
    return res.status(200).json({ message: 'Book added to the bookshelf' });
    // Return success message
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
  }, 
  getbookshelf: async (req, res) => { 
  try {
    // Get user ID from request parameter
    const userId =req.params.userId;
    // Verify that user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Find bookshelf for the user
    const bookshelf = await Bookshelf.findOne({user:userId}).populate('drawers.books');

    
    if(!bookshelf)
    {
      return res.status(200).json([]);
    }
    res.json(bookshelf. drawers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
  }
};

module.exports = BookshelfCtrl;
