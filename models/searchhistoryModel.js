const mongoose = require('mongoose');

const SearchHistory = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
  query : [
   { type:String
 } ],
});

module.exports = mongoose.model('historysearch', SearchHistory);
