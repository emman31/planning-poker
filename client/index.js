$(window).load(function document_ready() {
  var socket = io.connect();

  socket.emit("execute", "JoinRoom", ['pathname=' + window.location.pathname]);
});