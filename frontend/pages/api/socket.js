import { Server } from "socket.io";

const SocketHandler= async (req, res) => {
    if (res.socket.server.io) {
        console.log("Already set up");
        // res.end();
        // return;
    }
    else{
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on("connection", (socket) => {
            console.log("New client connected");
        })

    }
    res.end();
}

export default SocketHandler;