const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const user_routes = require("./routes/user_routes.js");
const cors = require("cors");
const mongoDb = require("./config/db.js");
const { initSocket } = require("./socket.js");
const path = require("path");

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

mongoDb();
