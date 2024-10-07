import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import { useUsername } from '../context/username';
import styles from '../styles/home.module.css';
import { useNavigate } from 'react-router-dom';
import Login from '../component/Login/Login';


export default function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [isHosting, setHosting] = useState(true);
  const [MeetingTitle, setMeetingTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userId, loggedIn, username, host, sethost } = useUsername();
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 992);
  };

  useEffect(() => {
    handleResize(); 
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCreateMeeting = async (roomId, roomData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_CLIENT_URL}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(roomData),
      });

      if (response.ok) {
        sethost(roomData.host);
        const data = await response.json();
        // console.log('Meeting created:', data);
        navigate(`/${roomId}`);
      } 
      // else {
      //   console.error('Failed to create meeting');
      // }
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const createAndJoin = () => {
    const roomId = uuidv4();
    const roomData = {
      title: MeetingTitle,
      host: userId,
      participants: [userId],
      roomId: roomId,
      userId: userId,
    };

    handleCreateMeeting(roomId, roomData);
  };

  const joinRoom = () => {
    if (roomId) {
      navigate(`/${roomId}`);
    } else {
      alert('Please provide a valid room ID');
    }
  };

  useEffect(() => {
    if(userId){
      setIsLoading(false);

    }  
  }, [userId]);

  return (
    <div className="flex h-screen">
      {!isMobile && (
        <div className="md:w-2/5 sm:w-2/4 bg-[#354bab] flex items-center justify-center sm:px-10">
          <div className="text-white text-left max-w-md">
            <h1 className="text-6xl font-bold mb-6">Connect professionally.</h1>
            <p className="text-xl mt-5 font-semibold">
              Video calls, meeting notes, chat and more
            </p>
          </div>
        </div>
      )}
      <div className={`bg-[#1e1e1e] ${isMobile ? 'w-full' : 'w-3/5'} flex items-center justify-center bg-darkBlue md:px-0 md:py-10`}>
        <Login 
          loggedIn={loggedIn} 
          username={username} 
          userId={userId} 
          isHosting={isHosting}
          setMeetingTitle={setMeetingTitle} 
          MeetingTitle={MeetingTitle} 
          createAndJoin={createAndJoin} 
          roomId={roomId} 
          setRoomId={setRoomId} 
          joinRoom={joinRoom} 
          setHosting={setHosting} 
          isLoading={isLoading} 
          setIsLoading= {setIsLoading}
          navigate={navigate} 
        />
      </div>
    </div>
  );
}
