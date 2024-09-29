import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const connection = io('https://vidtalk.onrender.com/'); 

        connection.on('connect', () => {
            console.log('Socket connected:', connection.id);
        });

        connection.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setError(err.message);
        });

        connection.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        setSocket(connection);

        return () => {
            connection.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, error }}>
            {children}
        </SocketContext.Provider>
    );
};
