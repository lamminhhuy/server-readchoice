const Book = require('../models/bookModel');
const Post = require('../models/postModel');
const Review = require('../models/reviewModel');
const mongoose = require('mongoose');
const comment = require('../models/commentModel')
const reviewCtrl = {
  createReview: async (req, res) => {
    const { userId, bookId } = req.params;
    const { reviewText } = req.body;
    try {
      // Check if user has already reviewed the book
      let existingReview = await Review.findOne({ book: bookId, user: userId });

      if (existingReview) {
        // Update existing review
        existingReview.content = reviewText;
        await existingReview.save();
        return res.status(200).json(existingReview);
      } else {
        // Create new review
        const newReview = new Review({
          author: mongoose.Types.ObjectId(userId),
          content: reviewText,
          book:bookId,
        });
        await newReview.save();


        return res.status(201).json(newReview);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },

  getReviews: async (req, res) => {
    const { bookId } = req.params;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(bookId);
if (!isValidObjectId)
{
  return res.status(404).json({ message: 'No reviews found for this book.' });
}
    try {
      const reviews = await Review.find({ book: bookId }).populate('author').populate('comments');
      if (reviews.length === 0) {
        return res.status(404).json({ message: 'No reviews found for this book.' });
      }
      return res.status(200).json(reviews);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
  likeReviews: async (req,res) => {
    const reviewId = req.params.id;
    const userId = req.params.user_id;
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      const isLiked = review.likes.includes(userId);
      if (isLiked) {
  
        const index = review.likes.indexOf(userId);
        if (index === -1) {
          return res.status(400).json({ message: 'Review not liked by the user' });
        }
    
        review.likes.splice(index, 1);
        await review.save();
    
        return res.status(200).json({ message: 'Review unliked successfully' });
      }
      review.likes.push(userId);
      await review.save();
      return res.status(200).json({ message: 'Review liked successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  },
  unlikeReviews: async (req,res) => {
    const { bookId, reviewId, commentId } = req.params;
    const userId = req.user.id;
  
    try {
      // Find the review that contains the comment
      const review = await Review.findOne({ _id: reviewId, book: bookId });
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }
  
      // Find the comment and check if the user has already liked it
      const commentIndex = review.comments.findIndex(comment => comment._id.equals(commentId));
      if (commentIndex === -1) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      const comment = review.comments[commentIndex];
      if (!comment.likes.includes(userId)) {
        return res.status(400).json({ error: 'You have not liked this comment' });
      }
  
      // Remove the user's like from the comment
      comment.likes.pull(userId);
  
      // Save the updated review
      await review.save();
  
      res.json({ message: 'Comment unliked successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  },
  commentReviews: async (req,res) => {
    const reviewId = req.params.id;
    const userId =req.params.user_id;
    const content  = req.body.content;
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      const newComment = new comment({
        user: userId,
        content: content
      });
      await newComment.save();
      review.comments.push(newComment);
      await review.save();
      return res.status(200).json(newComment );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
};

module.exports = reviewCtrl;


