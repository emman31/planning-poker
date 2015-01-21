var http = require('http').createServer(onRequest),
  io = require('socket.io').listen(http, {log: false}),
  url = require('url'),
  fs = require('fs'),
  logger = require('logger'),
  planningPoker = require('./planning-poker');

http.listen(9999);

function onRequest(request, response) {
  var path = url.parse(request.url).pathname;

  if (path === '/') {
    path += 'index.html';
  }

  // path structure should be /[room]/[page]. For the file path, we must remove the room name.
  var pathParts = path.split('/');
  if (pathParts.length >= 3) {
    var filePath = path.replace("/" + pathParts[1], "");
  }
  else {
    filePath = path;
  }

  // if the path ends with a slash '/', we must remove it.
  if (filePath.slice(-1) === '/') {
    filePath = filePath.substring(0, filePath.length - 1);
  }

  // if the file has no extension, we force .html.
  if (filePath.indexOf('.') === -1) {
    filePath += ".html";
  }

  // All client requests for a file are redirected towards the 'client' folder.
  if (!fs.existsSync(__dirname + '/../client' + filePath)) {
    filePath = "/index.html";
  }
  filePath = "/client" + filePath;

  var extension = path.split('/').pop().split('.').pop();
  var header;
  switch (extension) {
    case 'html':
      // Nothing needed fot html files.
      break;
    case 'css':
      header = {"Content-Type": "text/css"};
      break;
    case 'js':
      header = {"Content-Type": "application/javascript"};
      break;
    default:
  }

  fs.readFile(__dirname + '/..' + filePath,
    function (err, data) {
      if (err) {
        response.writeHead(500, header);
        return response.end("Error loading file '" + filePath + "'");
      }

      response.writeHead(200, header);
      response.write(data);
      response.end();
    }
  );
}

io.sockets.on('connection', function (socket) {
  var id = socket.id;
  logger.Log("Client connected: " + id);

  socket.on('execute', function execute(command, params) {
    logger.Log("Executing command '" + command + "' for client '" + id + "'.");
    var functionToExecute = planningPoker[command];

    // Make sure the command is an existing function.
    if (typeof functionToExecute !== 'function') {
      logger.Log(command + " is not a valid command.");
      return;
    }

    // Make sure params is an array of parameters.
    if (typeof params === 'undefined') {
      params = new Array();
    }
    else if (!(params instanceof Array)) {
      socket.emit('response', "ERROR", ["The 2nd parameter passed to Execute should be an array of parameters."]);
      logger.Log("The 2nd parameter passed to Execute should be an array of parameters.");
      return;
    }

    // Execute the function and make sure nothing crashes the server.
    var returnValue;
    try {
      params.unshift(socket);
      params.unshift(io);
      returnValue = functionToExecute.apply(planningPoker, params);
      if (returnValue !== null && typeof returnValue !== 'undefined') {
        socket.emit('response', command, returnValue);
      }
    }
    catch (e) {
      socket.emit('response', "ERROR", ["A server error occurred. What are you trying to do?!?"]);
      logger.Log(e.stack);
    }
  });
});

planningPoker.InitServer(io);

console.log("Server has started.");
