const users = {};

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-room", async (roomId, userId, username, dbId) => {
      username = JSON.parse(username);
      console.log(`Server received join-room with parsed username: ${username}`);
      console.log(`In socket: ${username} (${userId}) joined room ${roomId}`);
      socket.join(roomId);

      users[userId] = username;
      socket.to(roomId).emit("user-connected", userId, username, dbId);

      const existingUsernames = Object.entries(users)
        .filter(([id]) => id !== userId)
        .map(([id, name]) => ({ id, name }));

      socket.emit("existing-usernames", existingUsernames);
    });

    socket.on("chat-message", ({roomId, message, senderName, senderId}) => {
      socket.broadcast.to(roomId).emit("receive-message", message, senderName, senderId);
      console.log("Message sent from server", message);
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
}

module.exports = { initSocket };
