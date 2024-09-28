
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;


app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Socket.IO Server!</h1>');
});

const users = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", async (roomId, userId, username, dbId) => {
    username = JSON.parse(username);
    console.log(`Server received join-room with parsed username: ${username}`);
    console.log(`in socket- ${username} (${userId}) joined room ${roomId}`);
    socket.join(roomId);

    users[userId] = username;
    socket.to(roomId).emit("user-connected", userId, username, dbId);

    const existingUsernames = Object.entries(users)
      .filter(([id]) => id !== userId)
      .map(([id, name]) => ({ id, name }));

    socket.emit("existing-usernames", existingUsernames);
  });

  socket.on("chat-message", (roomId, message, username, userId) => {
    socket.broadcast.to(roomId).emit("receive-message", message, username, userId);
    console.log("message sent from server");
  });

  socket.on("user-leave", (userId, roomId) => {
    console.log(`${users[userId]} (${userId}) is leaving room ${roomId}`);
    socket.broadcast.to(roomId).emit("user-leave", userId);
    delete users[userId];
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});



server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
