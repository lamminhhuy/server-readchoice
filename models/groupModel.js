const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a group name.'],
    maxlength: [100, 'Group name cannot be more than 100 characters.']
  },
  description: {
    type: String,
    maxlength: [1000, 'Group description cannot be more than 1000 characters.']
  },
  rules: {
    type:String,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Group', groupSchema);
