import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios'; 
import {jwtDecode} from 'jwt-decode';

const UsernameContext = createContext();

export const UsernameProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [host, sethost] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false); 

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log(token)

    if (token) {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp > currentTime) {
        setLoggedIn(true);
        setUsername(decodedToken.name || 'guest');
        setAvatar(decodedToken.picture);

        if (!isRegistered) {
          const registerUser = async () => {
            try {
              const response = await axios.post('http://localhost:5000/api/auth/google-signin', {
                googleId: decodedToken.sub,  
                name: decodedToken.name,
                email: decodedToken.email,
                avatar: decodedToken.picture,
              });
              console.log("User registered:", response.data);
              setUserId(response.data.userId);
              setIsRegistered(true);
            } catch (error) {
              console.error("Error registering user:", error);
            }
          };
          
          registerUser();
        }
      } else {
        localStorage.removeItem('access_token');
        setLoggedIn(false);
      }
    } else {
      setLoggedIn(false);
    }
  }, [isRegistered]); 

  return (
    <UsernameContext.Provider value={{ username, userId, loggedIn, host, sethost, avatar }}>
      {children}
    </UsernameContext.Provider>
  );
};

export const useUsername = () => useContext(UsernameContext);
