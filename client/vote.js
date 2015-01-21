$(window).load(function document_ready() {
  var socket = io.connect();

  var pathParts = window.location.pathname.split('/');
  socket.emit("execute", "JoinRoom", [pathParts[1]]);


  socket.emit("execute", "LoadConfigs");

  socket.on("test", function() {
    console.log("test");
  });

});