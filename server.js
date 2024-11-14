const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Event when a user joins
  socket.on('setUsername', (username) => {
    users.push({ id: socket.id, username });
    io.emit('userList', users);
    console.log(`${username} has joined the chat`);
  });

  // Event to broadcast message to everyone
  socket.on('chatMessage', (msg) => {
    const user = users.find(u => u.id === socket.id);
    const timestamp = new Date().toLocaleTimeString();
    io.emit('message', { user: user.username, message: msg, timestamp });
  });

  // Event to handle private messages
  socket.on('privateMessage', (data) => {
    const recipientSocket = users.find(u => u.username === data.to)?.id;
    if (recipientSocket) {
      const timestamp = new Date().toLocaleTimeString();
      io.to(recipientSocket).emit('privateMessage', { 
        from: data.from, 
        message: data.message, 
        timestamp 
      });
    }
  });

  // Event when user disconnects
  socket.on('disconnect', () => {
    users = users.filter(u => u.id !== socket.id);
    io.emit('userList', users);
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
