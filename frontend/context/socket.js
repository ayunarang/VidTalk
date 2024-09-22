import { createContext , useContext, useEffect, useState} from "react";
const {io} = require("socket.io-client");

const SocketContext= createContext(null);

export const useSocket = () => {
    const socket= useContext(SocketContext);
    return socket;
}
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const Connection = io();
        setSocket(Connection);
        console.log("socket set", Connection);
        
    }, []);

    socket?.on('connect_error', async(err)=>{
        console.log("socket connection error", err);
        await fetch('/api/socket');
    })

    return <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>;

}