module.exports.socketManager = (_socket, io) => {

  console.log("connection to socket successfull")
  
  // get the current socket and store in the export object 
  module.exports.socket = _socket;

  // store the socket.io object as well;
  module.exports.io = io;
  
  // set up a notification message to track when a socket has disconnected
  io.on("disconnect", () => {
    console.log("a socket disconnected");
  })
}

module.exports.ioemitter = (event, data) => {
  this.io.emit(event, data)
}

module.exports.emitter = (event, data) => {
  this.socket.emit(event, data);
}