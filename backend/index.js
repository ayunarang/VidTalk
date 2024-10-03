const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const user_routes = require("./routes/user_routes.js");
const cors = require("cors");
const mongoDb = require("./config/db.js");
const { initSocket } = require("./socket.js");
const path = require("path");
const ORIGIN = process.env.ORIGIN;


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

const corsOptions = {
  origin: ORIGIN,
  credentials: true 
};
app.use(cors(corsOptions));

app.use('/api', user_routes);


// ---deployment

const _dirname1 = path.resolve();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(_dirname1, '../client/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(_dirname1, '../client', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running successfully!');
  });
}

// ----deployment

initSocket(io); 

const PORT = process.env.PORT;
server.listen(PORT, () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://vidtalk.onrender.com/' 
    : `http://localhost:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
});


mongoDb();