import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState } from 'react';

const UsernameContext = createContext();

export const UsernameProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [loggedIn, setloggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [host, sethost] = useState(null);
  const [avatar, setavatar] = useState(null);


const { data, status } = useSession();
console.log(data, status);

useEffect(() => {
  const isAuthenticated = status === 'authenticated';
  if (isAuthenticated !== loggedIn) {
    setloggedIn(isAuthenticated);
    setUsername(data?.user?.name || 'guest');
    setUserId(data?.user?.id);
    setavatar(data?.user?.image);
  }
}, [status, loggedIn]);


  

  return (
    <UsernameContext.Provider value={{ username, userId ,loggedIn, host, sethost, avatar}}>
      {children}
    </UsernameContext.Provider>
  );
};

export const useUsername = () => useContext(UsernameContext);
