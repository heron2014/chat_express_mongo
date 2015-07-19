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
      io.emit('usernames', nicknames); // we are sending nicknames back to client
    }
  });

  socket.on('send message', function(data) { // receive message from client
    io.emit('new message', data); //send it back to users
  });
});


http.listen(8000, function(){
  console.log('listening on *:8000');
});