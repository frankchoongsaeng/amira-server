const express = require("express");
const app = express();
const server = require("http").createServer(app);
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const db = require("./dbconnect")
const router = require("./src");
const socket = require("./socket");

// load the environment variables
dotenv.config()

// start a connection to the database
db.connect();


// configure and start socket.io
const io = require("socket.io")(server, {
  path: "/socket.io",
  forceNewConnection: true,
  allowUpgrades: true,
  allowRequests(){},
  transports: ["websocket", "polling"],
  cors: {
    origin: ["http://localhost:3000", "/"],
    credentials: true,
    methods: "GET, POST, PUT, DELETE"
  }
});

io.on("connection", (soc) => { socket.socketManager(soc, io) });



// enable cross-origins-requests
app.use(cors())


// route all requests to 
app.use(express.static("build"))


// send all requests to the router
app.use("/api", router)


// serve the html file no matter the route
app.get('*', (req, res) => {
  res.type("html");
  res.sendFile(path.join(__dirname + '/build', 'index.html'));
});


// start the server
server.listen(process.env.PORT, () => {
  console.log("your server is now listening on port " + process.env.PORT);
})