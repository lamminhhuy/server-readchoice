const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    status: {type: String},
    
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'book'
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'comment' }],
    
  
    system: {type: mongoose.Types.ObjectId, ref: 'user'},
    user: {type: mongoose.Types.ObjectId, ref: 'user'},
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'group',
      },
}, {
    timestamps: true
})

module.exports = mongoose.model('Post', postSchema)