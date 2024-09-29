const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const user_routes = require("./routes/user_routes.js");
const cors = require("cors");
const mongoDb = require("./config/db.js");
const { initSocket } = require("./socket.js");
require('dotenv').config();


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true 
};
app.use(cors(corsOptions));

// Routes
app.use('/api', user_routes);

// Initialize socket
initSocket(io); // Pass io object instead of server

const PORT = process.env.PORT ;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

mongoDb();
