import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios'; 

const UsernameContext = createContext();

export const UsernameProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [host, sethost] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false); 

  const { data, status } = useSession();
  console.log(data, status);

  useEffect(() => {
    const isAuthenticated = status === 'authenticated';

    if (isAuthenticated !== loggedIn) {
      setLoggedIn(isAuthenticated);
      setUsername(data?.user?.name || 'guest');
      setAvatar(data?.user?.image);

      if (isAuthenticated && !isRegistered) {
        const registerUser = async () => {
          try {
            console.log("post request to server")
            const response = await axios.post('http://localhost:5000/api/auth/google-signin', {
              googleId: data.user.id, 
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.image,
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
    }
  }, [status, loggedIn, isRegistered]); 

  return (
    <UsernameContext.Provider value={{ username, userId, loggedIn, host, sethost, avatar }}>
      {children}
    </UsernameContext.Provider>
  );
};

export const useUsername = () => useContext(UsernameContext);
