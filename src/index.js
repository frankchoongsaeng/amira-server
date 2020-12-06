const router = require("express").Router();
const bodyParser = require("body-parser");
const cors = require("cors");
const userRouter = require("./routes/user_router");
const resourceRouter = require("./routes/resource_router");
// const resourceRouter = require("./routes/not");

// allow cross-origin-request-service
// router.use(cors());

// parse any content in the body of a request to json
router.use(bodyParser.json());

// route all requests according to routes

/**
 * /user - send all /user requests to the user router
 */
router.use("/user", userRouter);

/**
 * /resource - send all /beneficiary request to the resource router
 */
router.use("/beneficiary", resourceRouter);

/**
 * send this default response if the user access the wrong route 
 */
// router.use(notFound);


// export the router
module.exports = router;