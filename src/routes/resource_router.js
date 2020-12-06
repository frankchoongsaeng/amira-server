const r_router = require("express").Router();
const { addBeneficiary, getBeneficiaries } = require("../controllers/beneficiary_controller");


// get the beneficiary data
r_router.get("/", (req, res) => {
  

  /*
  
  let token = req.headers.cookie;
  if(token && token.length > 0)
    token = token.split("=")[1];
  else 
    token = req.body.token

  */

  getBeneficiaries(req.headers, (status, response) => {
    res.status(status);
    res.json(response);
  });
  
});


// get the beneficiary data of 
// a single beneficiary
r_router.get("/:id", (req, res) => {

  let token = req.headers.cookie.split("=")[1] || false;
  
  getBeneficiaries(token, (status, response) => {
    res.status(status);
    res.json(response);
  });
  
});


// add beneficiary data to  database
r_router.post("/add", (req, res) => {
  const requestData = req.body;

  addBeneficiary(requestData, (status, response) => {
    res.status(status);
    res.json(response);
  });
});


// export the resource router
module.exports = r_router;