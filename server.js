var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http),
nicknames = []; // list of our users connected to the chat

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  socket.on('new user', function(data, callback) {
    if(nicknames.indexOf(data) !== -1) { //we are checking if the nickname already exist in our array
      callback(false); // we are sending just value false to the client if nickname already exist
    } else {
      callback(true);
      socket.nickname = data; //we are creating nickname property on socket object which will hold new nickname 
      nicknames.push(socket.nickname); //we push that new nickname to our array
      updateNicknames(); // we are sending nicknames back to client
    }
  });

  function updateNicknames() {
    io.emit('usernames', nicknames);
  }

  socket.on('send message', function(data) { // receive message from client
    io.emit('new message', data); //send it back to users
  });

  //disconnect users when they are not in chat - dont show usernames nicknames when they are not connected to chat
  socket.on('disconnect', function(data) {
    //check if users have set names
    if (!socket.nickname) return;

    nicknames.splice(nicknames.indexOf(socket.nickname), 1); //delete nickname from the array 

    //sending back the correct list of connected users
    updateNicknames();
  });

});


http.listen(8000, function(){
  console.log('listening on *:8000');
});