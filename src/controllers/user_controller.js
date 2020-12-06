const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user_model");
const Token = require("../models/token_model");

/** 
 * request email and password from the database and check if the
 * user provided the correct email and password.
 */
function authenticateUser({ email, password } = {}, callback) {
  
  /** 
   * ===========================
   * VALIDATE PROVIDED DATA
   * 
   * */ 

  // no empty email
  if( email.trim().length === 0 ) {
    email = false
  }

  // password length must be 6 or more 
  if( password.trim().length < 6 ) {
    password = false
  }

  if( email && password ) {

    User.findOne({ email: email }, (err, user) => {

      if(user) {

        // compare the users password to see if 
        // the stored hashed password matches the
        // password provided by the user 
        bcrypt.compare(password, user.password, (err, isMatch) => {

          // stop if an error occurred
          if(err) {
            console.log(err);
            callback(500, {"response": "unable to check password"})
          }
          // continue if the password was a match
          else if(isMatch) {

            // create a token for the user
            let new_token = createUserToken(user);

            // add the token to the database
            new_token.save();

            // update the user with the token
            User.updateOne({ _id: user._id }, { 
              $set: { currentToken: new_token._id }, 
              $push: { tokens: new_token._id } }, (err) => {
              if(err) {
                console.log(err);
                callback(500, {"response": "could not update user with his token"})
              }
              else {
                callback( 200, { token: new_token.token, user } );
              }
            });
          } 
          else {
            callback(401, {"response": "password incorrect"});
          } 

        });
        

      } else {
        // user does not exists in database
        callback(404, {"response": "user does not exist"});
      }
    });

  }
  else {
    callback(400, {"response": "missing required field or fields"} );
  }


}



/**
 * register a new user in the database/system
 * REQUIRED: firstName, lastName, email, password, address, tel_number, position, company
 */
function createUser({ firstName, lastName, email, password, address, telephoneNumber, position, company } = {}, callback) {

  /** 
   * ===========================
   * VALIDATE PROVIDED DATA
   * 
   * */ 

  // no empty first name,
  if( firstName && firstName.trim().length === 0 ) {
    firstName = false;
  }

  // no empty last name
  if( lastName && lastName.trim().length === 0 ) {
    lastName = false
  }

  // no empty email
  if(email && email.trim().length === 0 ) {
    email = false
  }

  // password length must be 6 or more 
  if( password && password.trim().length < 6 ) {
    password = false
  }

  // no empty address
  if( address && address.trim().length  === 0 ) {
    address = false;
  }

  // no empty company
  if( company && company.trim().length === 0 ) {
    company = false; 
  }

  if( firstName && lastName && email && password && address && company ) {

    User.findOne({ email: email }, (err, user) => {

      if(!user) {

        // hash the users password using the SaltOrRounds variable in our environment
        let salt_or_rounds = parseInt(process.env.SALT_OR_ROUNDS);
        let generatedSalt = bcrypt.genSaltSync(salt_or_rounds);
        let hashedPassword = bcrypt.hashSync(password, generatedSalt);
        
        // create the user document and save it
        const new_user = new User({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: hashedPassword,
          address: address,
          telephone_number: telephoneNumber,
          position: position,
          company: company
        });

        // save the user to the database
        new_user.save()
        .then( user => {

          // create a token for the user
          let new_token = createUserToken(new_user);

          // add the token to the database
          new_token.save();

          // update the user with the token
          User.updateOne({ _id: new_user._id }, {
            $set: { currentToken: new_token._id }, 
            $push: { tokens: new_token._id } }, (err) => {
            if(err) {
              console.log(err);
              callback(500, {"response": "could not update user with token"})
            }
            else {
              callback( 201, { token: new_token.token, user } );
            }
          });
        })
        .catch( (err) => {
          // unable to save new user
          console.log(err);
          callback(500, {"response": "could not register new user"})
        });

      } else {
        // user already exists in database
        callback(409, {"response": "user already exists"});
      }
    });

  } else {
    callback(400, {"response": "missing required field or fields"} );
  }
}

function logout({ token }) {
  /** 
   * ===========================
   * VALIDATE PROVIDED DATA
   * 
   * */ 

  // no empty token
  if( token.trim().length === 0 ) {
    token = false
  }


  if( token ) {

    let decoded_token = jwt.decode(token)
    console.log(decoded_token);

    // find the current_token of the whose id is 
    // stored in the token 
    User.updateOne({ _id: decoded.id }, { currentToken: undefined }, (err, user) => {
      if(!err) {
        callback(200, {"response": "logout successfull"});
      }
    });

  }
  else {
    callback(400, {"response": "missing required token"} );
  }
}

/**
 * create a new user token
 * store the token in the database
 * attach the token to the user
 * REQUIRED: userData - from the database
 */
function createUserToken(userData) {
  
  let token = jwt.sign({ id: userData._id }, process.env.SECRET, {expiresIn: "7 days"});
  
  let new_token = new Token({
    token: token,
    userId: userData._id
  });

  return new_token
}
 

module.exports = {
  authenticateUser,
  createUser,
  logout
}


// https://www.npmjs.com/package/bcrypt#usage