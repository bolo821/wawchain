const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Token = mongoose.model('Token');

router.post("/search", async (req, res) => {
  searchTerm = req.body.searchTerm;

  let findrlt = await Token.find({
    $or: [
      {name: new RegExp(`^.*${searchTerm}.*$`, 'i')}, 
      {symbol: new RegExp(`^.*${searchTerm}.*$`, 'i')},
      {address: new RegExp(`^.*${searchTerm}.*$`, 'i')}
    ]
  }).catch(err => {
    console.log('error during search token: ', err);
  });
  
  if(findrlt.length) {
    res.json({
      success: true,
      tokens: findrlt,
    });
  } else {
    res.json({
      success: false,
      tokens: []
    });
  }
});

module.exports = router;