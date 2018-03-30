// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');
var fs = require('fs'); 

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
    if (users[socket.id] != undefined) {
      io.to(users[socket.id][1]).emit('message', ['_System', 'User ['+users[socket.id][0]+'] has left']);
      delete users[socket.id];
    }
  });

  // Authentication attempts
  socket.on('auth', function(data){
    var userList = require('./users.json');
    uName = data[0]
    pHash = data[1]
    room = data[2]
    console.log(uName + ' : ' + pHash + ' : ' + room);
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

  //New accounts
  socket.on('new account', function(data){
    if (userList[data[0]] == undefined) {
      console.log("New user request : "+data[0]+":"+data[1]);
      io.to(socket.id).emit('request done', data[0]);
    } else {
      io.to(socket.id).emit('user check failed', data[0]);
    }
  });

  // Getting a message
  socket.on('message', function(data) {
    var msg = data['data'][1];
    io.to(data['room']).emit('message', data['data']);
    if (msg.startsWith('?')) {
      if (msg.startsWith('?kick ') && userList[users[socket.id][0]].admin) {
        for (key in users) {
          if (users[key][0] == msg.substring(6, 99)) {
            io.to(key).emit('kicked');
          }
        }
      }
      } else if (msg == '?ping') {
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
