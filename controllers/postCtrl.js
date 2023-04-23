const Posts = require('../models/postModel')
const Comments = require('../models/commentModel')
const User = require('../models/userModel')
const Book = require('../models/bookModel')
const axios = require("axios")
class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

const postCtrl = {
    createPost: async (req, res) => {
        try {       
  try {
    // Kiểm tra các trường bắt buộc
    if (!req.body.content || !req.body.book || !req.user) {
      return res.status(400).json({ msg: 'Các trường status, book, và user là bắt buộc' });
    }
    console.log(req.body.book)
 let book = await Book.findOne({ googleBooksId: req.body.book.id });
 if (!book) {
  book = new Book({
    googleBooksId: req.body.book.id,
    title: req.body.book.volumeInfo.title,
    author: req.body.book.volumeInfo.authors ? req.body.book.volumeInfo.authors.join(', ') : 'N/A',
    publicationDate: req.body.book.volumeInfo.publishedDate,
    isbn: req.body.book.volumeInfo.industryIdentifiers ? req.body.book.volumeInfo.industryIdentifiers[0].identifier : 'N/A',
    description: req.body.book.volumeInfo.description ? req.body.book.volumeInfo.description : "" ,
    genre: req.body.book.volumeInfo.categories ? req.body.book.volumeInfo.categories.join(', ') : 'N/A',
    coverImage: req.body.book.volumeInfo.imageLinks && req.body.book.volumeInfo.imageLinks.thumbnail ,
    downloadLink: req.body.book.accessInfo.epub.acsTokenLink?  req.body.book.accessInfo.epub.acsTokenLink : "" ,
    buyLink: req.body.book.saleInfo.buyLink ? req.body.book.saleInfo.buyLink: "",
    averageRating:req.body.book.volumeInfo.averageRating,
    ratingsCount:req.body.book.volumeInfo.ratingsCount  
 })};
 await book.save()  

    const post = new Posts({
      status: req.body.content,
      book: book._id,
      user: req.user._id,
      group: req.body?.groupId 
    });
    
    // Kiểm tra xem user đã tồn tại hay chưa
    const existingUser = await User.findById(req.user._id);
    if (!existingUser) {
      return res.status(400).json({ msg: 'User không tồn tại' });
    }

    // Kiểm tra xem book đã tồn tại hay chưa

    await post.save();
    const newpost = await Posts.findOne({ _id: post._id }).populate('book').populate('user');
    res.json(newpost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPosts: async (req, res) => {
        try {
            const features = new APIfeatures(
                Posts.find({
                  user: [...req.user.following, req.user._id],
                  group: { $exists: false } // thêm điều kiện lọc ra những bài đăng không có  trường group
                }), req.query
              ).paginating()

            const posts = await features.query.sort('-createdAt')
            .populate("book", "title coverImage author")
            .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })
            console.log (posts)
            res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
    updatePost: async (req, res) => {
        try {
            const { content, images } = req.body

            const post = await Posts.findOneAndUpdate({_id: req.params.id}, {
                content, images
            }).populate("user likes", "avatar username fullname")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            res.json({
                msg: "Updated Post!",
                newPost: {
                    ...post._doc,
                    content, images
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    likePost: async (req, res) => {
        try {
            const post = await Posts.find({_id: req.params.id, likes: req.user._id})
            if(post.length > 0) return res.status(400).json({msg: "You liked this post."})

            const like = await Posts.findOneAndUpdate({_id: req.params.id}, {
                $push: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This post does not exist.'})

            res.json({msg: 'Liked Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unLikePost: async (req, res) => {
        try {

            const like = await Posts.findOneAndUpdate({_id: req.params.id}, {
                $pull: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This post does not exist.'})

            res.json({msg: 'UnLiked Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserPosts: async (req, res) => {
        try {
            const features = new APIfeatures(Posts.find({user: req.params.id}), req.query)
            .paginating()
            const posts = await features.query.sort("-createdAt")

            res.json({
                posts,
                result: posts.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPost: async (req, res) => {
        try {
            const post = await Posts.findById(req.params.id)
            .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            if(!post) return res.status(400).json({msg: 'This post does not exist.'})

            res.json({
                post
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPostsDicover: async (req, res) => {
        try {

            const newArr = [...req.user.following, req.user._id]

            const num  = req.query.num || 9

            const posts = await Posts.aggregate([
                { $match: { user : { $nin: newArr } } },
                { $sample: { size: Number(num) } },
            ])

            return res.json({
                msg: 'Success!',
                result: posts.length,
                posts
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deletePost: async (req, res) => {
        try {
            const post = await Posts.findOneAndDelete({_id: req.params.id, user: req.user._id})
            await Comments.deleteMany({_id: {$in: post.comments }})

            res.json({
                msg: 'Deleted Post!',
                newPost: {
                    ...post,
                    user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    savePost: async (req, res) => {
        try {
            const user = await Users.find({_id: req.user._id, saved: req.params.id})
            if(user.length > 0) return res.status(400).json({msg: "You saved this post."})

            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $push: {saved: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'Saved Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unSavePost: async (req, res) => {
        try {
            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {saved: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'unSaved Post!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getSavePosts: async (req, res) => {
        try {
            const features = new APIfeatures(Posts.find({
                _id: {$in: req.user.saved}
            }), req.query).paginating()

            const savePosts = await features.query.sort("-createdAt")

            res.json({
                savePosts,
                result: savePosts.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}

module.exports = postCtrl