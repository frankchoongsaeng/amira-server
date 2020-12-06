const isDate = require('util').types.isDate;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user_model");
const Token = require("../models/token_model");
const Beneficiary = require("../models/beneficiary_model");
const socket = require("../../socket");

/** 
 * veryify if a token is valid
 * REQUIRED: token
 */
function isTokenValid(token = {}, callback) {

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (!err) {
      // console.group();
      // console.log("decoded token: ");
      // console.dir(decoded);
      // console.groupEnd();
      callback(decoded)
    }
    else {
      callback(false)
    }
  });
}


/**
 * add a beneficiary to the database and store 
 * the beneficiaries id under a field agent user
 * REQUIRED: first_name, last_name, date_of_birth, place_of_birth, education, gender, marital_status, guardian_name, guardian_alive, guardian_occupation, token
 */
function addBeneficiary({ firstName, lastName, dateOfBirth, placeOfBirth, education, gender, maritalStatus, guardianName, guardianAlive, guardianOccupation, token } = {}, callback) {

  /** 
   * ===========================
   * VALIDATE PROVIDED DATA
   * 
   * */

  // no empty first name,
  if (!firstName || firstName.trim().length === 0) {
    console.trace("fn: " + firstName);
    firstName = false;
  }

  // no empty last name
  else if (!lastName || lastName.trim().length === 0) {
    console.trace(lastName);
    lastName = false
  }

  // valid date for date of birth
  // if( !isDate(dateOfBirth) ) {
  //   console.trace(dateOfBirth);
  //   dateOfBirth = false
  // }

  // no empty place of birth
  else if (!placeOfBirth || placeOfBirth.trim().length === 0) {
    console.trace(placeOfBirth);
    placeOfBirth = false
  }

  // no empty education
  else if (!education || education.trim().length === 0) {
    console.trace(education);
    education = false
  }

  let __g = typeof gender === "string" ? gender.toLowerCase() : false;
  // gender must be male, female, m or f
  if (!(__g === "male" || __g === "female" || __g === "m" || __g === "f")) {
    console.trace(gender);
    gender = false
  }

  let __ms = typeof maritalStatus === "string" ? maritalStatus.toLowerCase() : false;
  // marital status must be single, married, or divorced
  if (!(__ms === "single" || __ms === "married" || __ms === "divorced")) {
    console.trace(maritalStatus);
    maritalStatus = false;
  }

  // guardianName must not be empty 
  else if (!guardianName || guardianName.trim().length === 0) {
    console.trace(guardianName);
    guardianName = false;
  }

  let __gChecker = true;
  // guardianAlive must be true or false 
  if (typeof guardianAlive !== "boolean") {
    console.trace(guardianAlive);
    __gChecker = false;
  }

  // guardianOccupation must not be empty
  else if (guardianOccupation && guardianOccupation.trim().length === 0) {
    console.trace(guardianOccupation);
    guardianOccupation = false;
  }

  // token must not be empty
  else if (token && token.trim().length === 0) {
    console.trace(token);
    token = false
  }

  // console.log(`fn: ${firstName} ln: ${lastName} dob: ${dateOfBirth} pob: ${placeOfBirth} edu: ${education} gender: ${gender} ms: ${maritalStatus} gn: ${guardianName} gAlive: ${__gChecker} go: ${guardianOccupation} token: ${token}`)

  if (firstName && lastName && dateOfBirth && placeOfBirth && education && gender && maritalStatus && guardianName && __gChecker && guardianOccupation && token) {

    // check if the token is valid
    isTokenValid(token, (decoded) => {
      if (decoded) {

        // continue to save the beneficiary to the database
        // if the token provided was valid 
        const _data = {
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          place_of_birth: placeOfBirth,
          education: education,
          gender: gender,
          marital_status: maritalStatus,
          guardian_name: guardianName,
          guardian_alive: guardianAlive,
          guardian_occupation: guardianOccupation,
          agentId: decoded.id,
          modified: new Date()
        }

        // create a new beneficiary document and save it
        const new_beneficiary = new Beneficiary(_data);
        new_beneficiary.save((nb_save_err, _nb) => {

          if (!nb_save_err) {
            // if the save was successfull
            // update the user with the beneficiary id
            User.updateOne({ _id: decoded.id }, { $push: { beneficiaries: _nb._id } }, (update_err) => {

              if (!update_err) {
                // callback a 201, and the created 
                // data if the update operation was successfull
                callback(201, { "response": _nb });
                // console.log();
                socket.ioemitter("beneficiaryAdded", _nb);
              }
              else {
                // callback a 500 if the update operation failed
                console.trace(update_err)
                callback(500, { "response": "unable to update user beneficiaries" });
              }

            });
          }
          else {
            console.trace(nb_save_err);
            callback(500, { "response": "unable to save new beneficiary, please try again" });
          }

        })

      } else {
        callback(403, { "response": "invalid header token, please login to continue" });
      }
    })
  }
  else {
    callback(400, { "response": "missing required field or fields" });
  }


}


/**
 * get beneficiaries stored in the database and 
 * related to the current user making a request
 * REQUIRED: token
 */
function getBeneficiaries({ token, role }, callback) {

  /** 
   * ===========================
   * VALIDATE PROVIDED DATA
   * 
  * */

  // token must not be empty
  if (!token || token.trim().length === 0) {
    console.log(token);
    token = false
  }

  if (!role || role.trim().length === 0) {
    console.log(role);
    role = false
  }

  if (token && role) {

    // check if the token is valid
    isTokenValid(token, (decoded) => {
      if (decoded) {

        // continue to get beneficiaries 
        if (role === "field agent") {

          Beneficiary.find({ agentId: decoded.id }, (no_b_err, all_beneficiaries) => {

            if (!no_b_err) {

              // return all beneficiaries
              callback(200, all_beneficiaries);
            }
            else {

              // error returning data
              console.log(no_b_err);
              callback(500, { "response": "cannot find beneficiaries" });
            }

          });

        } 
        else {

          // get all beneficiaries if the user
          // is not a field agent 
          Beneficiary.find({}, (no_b_err, all_beneficiaries) => {

            if (!no_b_err) {

              // return all beneficiaries
              callback(200, all_beneficiaries);
            }
            else {

              // error returning data
              console.log(no_b_err);
              callback(500, { "response": "cannot find beneficiaries" });
            }

          });

        }

      } else {
        callback(403, { "response": "invalid header token, please login to continue" });
      }
    })
  }
  else {
    callback(403, { "response": "missing required field or fields" });
  }


}


module.exports = {
  addBeneficiary,
  getBeneficiaries
}
