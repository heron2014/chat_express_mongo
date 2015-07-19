var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http),
users = {}; // list of our users connected to the chat, users is now an object because we want to store socket reference to each nickname as well

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

  socket.on('send message', function(data, callback) { // receive message from client

    //check if user tries to whisper to another (private message) by checking first 3 values of a string (it has to be /w)
    var msg = data.trim(); //first we trim the mesg incase user put extra empty spaces 
    if(msg.substr(0,3) === '/w ') {
      
      msg = msg.substr(3); //rest of message after /w 
      var first_space = msg.indexOf(' ');
      if( first_space !== -1) {
        //we want to do some name validation, if name that we want to whisper is in chat room 
        var name = msg.substring(0, first_space);
        var msg = msg.substring(first_space + 1);
        if (name in users) {
          //we are sending user and referenced socket
          users[name].emit('whisper', {msg: msg, nick: socket.nickname});
          console.log('this is data' + data);
          console.log({msg: msg, nick: socket.nickname});
          console.log('USER ' + socket.nickname);
          console.log('whisper');
        } else {
          callback('Error! Enter a valid user');
        }
        
      } else {
        //this is incase user put empty message , we will send them some sort of callabck
        callback('Error! Please enter a message for your whisper');
      }

    } else {
      io.emit('new message', {msg: msg, nick: socket.nickname}); //sends the message back to client plus the nickname of the owner of that message
    }    
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