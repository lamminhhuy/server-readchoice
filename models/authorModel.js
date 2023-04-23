const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationality: { type: String },
  birthdate: { type: Date },
  bio: { type: String }
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;