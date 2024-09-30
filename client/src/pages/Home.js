import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import { useUsername } from '../context/username';
import styles from '../styles/home.module.css';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';


export default function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [isHosting, setHosting] = useState(true);
  const [MeetingTitle, setMeetingTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userId, loggedIn, username, host, sethost } = useUsername();

  const handleCreateMeeting = async (roomId, roomData) => {
    try {
      const response = await fetch('https://vidtalk.onrender.com/api/meetings', {
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
        console.log('Meeting created:', data);
        navigate(`/${roomId}`);
      } else {
        console.error('Failed to create meeting');
      }
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
      <div className="w-2/5 bg-[#354bab] flex items-center justify-center p-10">
        <div className="text-white text-left max-w-md">
          <h1 className="text-6xl font-bold mb-6">Connect professionally.</h1>
          <p className="text-xl mt-5 font-semibold">
            Video calls, meeting notes, chat and more
          </p>
        </div>
      </div>
      <div className=" bg-[#1e1e1e] w-3/5 flex items-center justify-center bg-darkBlue p-10">
        <div className="text-white max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {loggedIn ? `Welcome back, ${username}` : 'Sign in to Vidtalk'}
          </h2>

          {!userId ? (
            <>
              <div className="flex justify-center items-center">
                <GoogleLogin
                  onSuccess={credentialResponse => {
                    console.log(credentialResponse);
                    localStorage.setItem('access_token', credentialResponse.credential);
                    window.location.reload();
                    setIsLoading(true);
                  }}
                  onError={() => {
                    console.log('Login Failed');
                  }}
                  size="large" 
                  theme="outline"
                  width="300" 
                  />
              </div>

              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <>
                </>
              )}

            </>
          ) : (
            <>
              {(userId) ? (
                <p
                  onClick={() => navigate('/meetingsDashboard')}
                  className='fixed top-5 right-5 text-xl text-[#aaaaaa] cursor-pointer font-semibold'>Go to dashboard</p>
              ) : (null)}
              {isHosting ? (
                <div className="flex flex-col gap-4">
                  <p className="mb-0 mt-2 text-[#aaaaaa]">Enter meeting Title</p>
                  <input
                    type="text"
                    className="px-4 py-3  text-xl w-full rounded text-black outline-none"
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    value={MeetingTitle}
                  />
                  <button
                    className="bg-[#5270EF] py-3 hover:bg-[#4a6cff] text-white px-4 rounded"
                    onClick={createAndJoin}
                  >
                    Create meeting URL
                  </button>
                  <div className="flex items-center text-center my-4">
                    <span className="flex-1 border-b border-gray-400"></span>
                    <span className="mx-4">or</span>
                    <span className="flex-1 border-b border-gray-400"></span>
                  </div>
                  <button
                    className="bg-gray-700 py-3 hover:bg-gray-600 text-white px-4 rounded"
                    onClick={() => setHosting(false)}
                  >
                    Join a meeting
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="mb-0 mt-2 text-[#aaaaaa]">Enter meeting ID</p>
                  <input
                    type="text"
                    className="px-4 py-3 text-xl w-full rounded text-black outline-none"
                    onChange={(e) => setRoomId(e.target.value)}
                    value={roomId}
                  />

                  <button
                    className="bg-[#5270EF] py-3 hover:bg-[#4a6cff] text-white px-4 rounded"
                    onClick={joinRoom}
                  >
                    Join meeting
                  </button>
                  <div className="flex items-center text-center my-4">
                    <span className="flex-1 border-b border-gray-400"></span>
                    <span className="mx-4">or</span>
                    <span className="flex-1 border-b border-gray-400"></span>
                  </div>

                  <button
                    className="bg-gray-700 py-3 hover:bg-gray-600 text-white px-4 rounded"
                    onClick={() => setHosting(true)}
                  >
                    Host a meeting
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
