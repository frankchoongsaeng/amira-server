const user_router = require("express").Router();
const { createUser, authenticateUser, logout } = require("../controllers/user_controller");


/**
 * login a user and return a token to the user.
 * REQUIRED: email, password
 */
user_router.post("/login", (req, res) => {
  const requestData = req.body;

  authenticateUser(requestData, (status, response) => {
    res.status(status);
    res.json(response);
  });
})


/**
 * logout a user .
 * REQUIRED: token
 */
user_router.post("/logout", (req, res) => {
  const requestData = req.body;

  logout(requestData, (status, response) => {
    if(status === 200) {
      res.setHeader("Set-Cookie", "authToken=" + response.token);
    }
    res.status(status);
    res.json(response);
  });
})


/**
 * signup a user and return a token to the user.
 * REQUIRED: firstName, lastName, email, password, address, telephoneNumber, position, company
 */
user_router.post("/signup", (req, res) => {
  const requestData = req.body;

  createUser(requestData, (status, response) => {
    if(status === 201) {
      res.setHeader("Set-Cookie", "authToken=" + response.token);
    }
    res.status(status);
    res.json(response);
  });
 
})

user_router.get("/signup", (req, res) => {
  const requestData = req.body;

  res.json( {data: "hello" } )
 
})

// export the user router
module.exports = user_router;
