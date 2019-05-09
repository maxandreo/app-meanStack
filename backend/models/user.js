const mongoose = require('mongoose');
// Plugin to check data before going on DB
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
