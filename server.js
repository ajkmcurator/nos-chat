// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');

// Variables
var cmdHelp = "?ping : see online users<br>?ping room : see users in your current room"
// User JSON list
var users = {};

// Port checking
if (process.argv[2] == undefined) {
  var port = 80;
} else {
  var port = process.argv[2]; // Use node server.js [port]
}

// Routing
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/static/index.html');
});

// Callbacks and network stuffs
io.on('connection', function(socket){
  // What happens when a user disconnects
  socket.on('disconnect', function(){
  });

  // Authentication attempts
  socket.on('auth', function(data){
    var userList = require('./users.json');
    uName = data[0]
    pHash = data[1]
    room = data[2]
    console.log(userList[uName] + ' : ' + pHash + ' : ' + room);
    if (userList[uName] !== undefined && pHash == userList[uName].pass) {
      // If they have logged in
      console.log('yay');
      socket.join(room);
      // Returns data to prevent tampering
      io.to(socket.id).emit('a-ok', data);
      io.to(room).emit('message', ['_System', 'User ['+uName+'] has joined']);
      users[socket.id] = [uName, room];
    }
  });

  // Getting a message
  socket.on('message', function(data) {
    var msg = data['data'][1];
    io.to(data['room']).emit('message', data['data']);
    if (msg.startsWith('?')) {
      if (msg == '?ping') {
        for (usr in users) {
          io.to(data['room']).emit('message', ['_System', users[usr]]);
        }
      } else if (msg == '?ping room') {
        for (usr in users) {
          if (users[usr][1] == data['room']) {
            io.to(data['room']).emit('message', ['_System', users[usr]]);
          }
        }
      } else if (msg == '?help') {
        io.to(data['room']).emit('message', ['_System', cmdHelp]);
      } else {
      }
      //console.log('data');
    }
  });
 
});

// Start the server
http.listen(port, function(){
  console.log('Listening on port:'+port);
  var userList = require('./users.json');
  console.log(userList);
});
