/**
 * Defines the structure for storing users data in the database
 */
const mongoose = require("mongoose");

// creating a new beneficiary model
const schema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  address: String,
  telephone_number: String,
  position: String,
  company: String,
  current_token: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Token"
  },
  tokens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Token"
  }],
  beneficiaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beneficiary"
  }]
})

// export the schema model
module.exports = mongoose.model("User", schema);