/**
 * Defines the structure for storing beneficiary data in the database
 */
const mongoose = require("mongoose");

// creating a new beneficiary model
const schema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  date_of_birth: Date,
  place_of_birth: String,
  education: String,
  gender: String,
  marital_status: String,
  guardian_name: String,
  guardian_alive: Boolean,
  guardian_occupation: String,
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  modified: Date
})

// export the schema model
module.exports = mongoose.model("Beneficiary", schema);