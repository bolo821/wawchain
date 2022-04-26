const mongoose = require("mongoose");
var autoIncrement = require('mongoose-auto-increment');

const TokenSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  address: {
    type: String,
  },
  decimals: {
    type: Number,
  },
  name: {
    type: String,
  },
  symbol: {
    type: String,
  },
});

autoIncrement.initialize(mongoose.connection);
TokenSchema.plugin(autoIncrement.plugin, 'Token');
module.exports = mongoose.model("Token", TokenSchema);
