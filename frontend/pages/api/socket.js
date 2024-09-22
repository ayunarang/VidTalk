

import { Server } from "socket.io";

const SocketHandler = (req, res) => {
    console.log("called api")
    if (res.socket.server.io) {
        console.log("socket already running")
    } else {
        const io = new Server(res.socket.server)
        res.socket.server.io = io
    
        io.on('connection', (socket) => {
            console.log("Server is connected");
      
            socket.on('join-room', (roomId, userId) => {
              console.log(`User ${userId} joined room ${roomId}`);
              socket.join(roomId);
              socket.broadcast.to(roomId).emit('user-connected', userId);
            });
      
            socket.on('user-toggle-audio', (userId, roomId) => {
              socket.broadcast.to(roomId).emit('user-toggle-audio', userId);
            });
      
            socket.on('user-toggle-video', (userId, roomId) => {
              socket.broadcast.to(roomId).emit('user-toggle-video', userId);
            });
      
            socket.on("screen-share", (roomId, userId) => {
              console.log(`User ${userId} started screen sharing in room ${roomId}`);
              socket.broadcast.to(roomId).emit('screen-share', userId);
            });
      
            socket.on("screen-share-stop", (roomId, userId) => {
              console.log(`User ${userId} stopped screen sharing in room ${roomId}`);
              socket.broadcast.to(roomId).emit('screen-share-stop', userId);
            });
      
            socket.on('user-leave', (userId, roomId) => {
              socket.broadcast.to(roomId).emit('user-leave', userId);
            });
          });
        }
        res.end();
}


export default SocketHandler;

