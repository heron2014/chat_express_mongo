var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('send message', function(data) { // receive message from client
    io.emit('new message', data); //send it back to users
  });
});


http.listen(8000, function(){
  console.log('listening on *:8000');
});