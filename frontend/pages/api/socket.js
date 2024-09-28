

import { Server } from "socket.io";


const users = {}; 


const SocketHandler = (req, res) => {
  console.log("Socket API called");

  if (res.socket.server.io) {
    console.log("socket already running")
  } else {
    const io = new Server(res.socket.server)
    res.socket.server.io = io

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


      socket.on('chat-message', (roomId, message, username, userId) => {
        socket.broadcast.to(roomId).emit('receive-message', message, username, userId);
        console.log("message sent from server");

      });


      socket.on("user-leave", (userId, roomId) => {
        console.log(`${users[userId]} (${userId}) is leaving room ${roomId}`);
        socket.broadcast.to(roomId).emit('user-leave', userId);
        delete users[userId]; 
        socket.leave(roomId);
      });
    });
  }
  res.end();
};

export default SocketHandler;
