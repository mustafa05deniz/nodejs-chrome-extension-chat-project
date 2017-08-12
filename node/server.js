
var userAgent = "mustafa!";
var srv = require("http").Server(function () {}),
    io = require("socket.io")(srv),
    csock; // current client

var PORT = 4444;


function setUserAgent(sock, userAgent) {
    console.log("Setting User-Agent to '" + userAgent + "'");
    sock.emit("user-agent", userAgent);
}


var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  var ip_address =  socket.handshake.address;
  csock = socket;
  setUserAgent(csock, userAgent);
  console.log(ip_address);


  socket.on('new message', function (data) {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {

    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});


process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function (text) {
    userAgent = text.trim();
    setUserAgent(csock, userAgent);
});

srv.listen(PORT);

