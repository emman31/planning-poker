/**
 * Initialise the server. This is executed only once when the server starts.
 * @returns {undefined}
 */
exports.InitServer = function InitServer(socket) {
  console.log("Server Initialized.");
};

exports.JoinRoom = function JoinRoom(io, socket, roomName) {
  socket.join(roomName);
};

exports.LoadConfigs = function LoadConfigs(io, socket) {
  io.to('patate').emit("test");
  var test = 'test';
}