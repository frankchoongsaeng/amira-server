const mongoose = require("mongoose");

// the required mongoose configuration to start a connection
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true
}

// connect to our mongodb database
module.exports.connect = () => {
  mongoose.connect(process.env.MONGODB_URI, options, (err) => {
    // log an error message if the connection fails
    if(err) {
      console.log("database connection failed");
      return;
    }
    // log an error message if the connection was successfull 
    console.log("database connection successful")
  });
}


