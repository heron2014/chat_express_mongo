var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http),
users = {}; // list of our users connected to the chat, users is now an object because we want to store socket reference to each nickname 

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  socket.on('new user', function(data, callback) {
    if(data in users) { //we are checking if the nickname already exist in our array
      callback(false); // we are sending just value false to the client if nickname already exist
    } else {
      callback(true);
      socket.nickname = data; //we are creating nickname property on socket object which will hold new nickname 
      users[socket.nickname] = socket;
      updateNicknames(); // we are sending nicknames back to client
    }
  });

  function updateNicknames() {
    io.emit('usernames', Object.keys(users)); //we are sending only nicknames (array) , no socket 
  }

  socket.on('send message', function(data) { // receive message from client
    io.emit('new message', {msg: data, nick: socket.nickname}); //sends the message back to client plus the nickname of the owner of that message
  });

  //disconnect users when they are not in chat - dont show usernames nicknames when they are not connected to chat
  socket.on('disconnect', function(data) {
    //check if users have set names
    if (!socket.nickname) return;

    delete users[socket.nickname];
    // nicknames.splice(nicknames.indexOf(socket.nickname), 1); delete nickname from the array 

    //sending back the correct list of connected users
    updateNicknames();
  });

});


http.listen(8000, function(){
  console.log('listening on *:8000');
});