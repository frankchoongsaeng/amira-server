/**
 * Defines the structure for storing user token data in the database
 */
const mongoose = require("mongoose");

// creating a new beneficiary model
const schema = new mongoose.Schema({
  token: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
})

// export the schema model
module.exports = mongoose.model("Token", schema);