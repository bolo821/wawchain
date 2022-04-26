const mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  verified: {
    type: Boolean,
  },
  rank: {
    type: Number,
    default: 3,
  },
  credits: {
    type: Number,
    default: 0,
  },
  resetpass: {
    type: Boolean,
    default: false,
  }
});

autoIncrement.initialize(mongoose.connection);
UserSchema.plugin(autoIncrement.plugin, 'User');
module.exports = mongoose.model("User", UserSchema);
