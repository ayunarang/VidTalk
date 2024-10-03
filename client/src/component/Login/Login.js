import React, { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ExternalLink } from 'lucide-react';

const Login = ({ loggedIn, username, userId, isHosting, setMeetingTitle, MeetingTitle, createAndJoin, roomId, setRoomId, joinRoom, setHosting, isLoading, navigate, setIsLoading }) => {

  return (
    <div className="text-white md:w-2/4 sm:w-2/4 w-3/4">

      {loggedIn ?
        <h2 className="sm:text-2xl md:text-3xl text-xl font-bold mb-8 text-center">
          Welcome back, {username}
        </h2>
        : (
          <h2 className="sm:text-xl md:text-2xl text-lg font-bold mb-8 text-center">
            Sign in to <span className="text-[#5270EF]">Vidtalk</span> to get started with your meeting.
          </h2>
        )}

{!userId && (
        <div className="left-50 flex justify-center items-center h-full md:mb-5">
          <div className="w-full flex justify-center mx-auto flex-row gap-3 items-start md:items-center align-middle">
          <p className='text-base sm:text-lg md:text-lg '>Continue with Google 👉 </p>

            <GoogleLogin
              onSuccess={credentialResponse => {
                console.log(credentialResponse);
                localStorage.setItem('access_token', credentialResponse.credential);
                window.location.reload();
              }}
              onError={() => {
                console.log('Login Failed');
              }}
              size="large"
              theme="outline"
              text="continue_with"
              type='icon'
              shape='rectangular'

            />
          </div>
        </div>
      )}
      {isLoading && (
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
      )}

      {userId && (
        <div className='flex flex-row gap-2 fixed top-5 right-5 md:text-xl sm:text-lg text-base text-[#aaaaaa] cursor-pointer font-bold justify-center items-center'>
          <p
            onClick={() => navigate('/meetingsDashboard')}>
            <span className='text-[#5270EF]'>Vidtalk</span> Dashboard
          </p>
          <ExternalLink className='md:text-xl sm:text-lg text-base text-[#aaaaaa] cursor-pointer' />
        </div>
      )}

      {isHosting ? (
        <div className="flex flex-col gap-4 px-3 md:px-0 sm:px-0">
          <p className="mb-0 mt-2 text-sm sm:text-base md:text-base text-[#aaaaaa]">Enter meeting Title</p>
          <input
            type="text"
            className="md:px-4 md:py-4 sm:px-3 sm:py-2 px-2 py-2 text-base sm:text-lg md:text-xl w-full rounded text-black outline-none"
            onChange={(e) => setMeetingTitle(e.target.value)}
            value={MeetingTitle}
            disabled={!userId}
          />
          <button
            className="bg-[#5270EF] hover:bg-[#4a6cff] text-white rounded md:px-4 md:py-4 sm:px-3 sm:py-2 px-2 py-2 text-base sm:text-lg md:text-xl "
            onClick={createAndJoin}
            disabled={!userId}
          >
            Create meeting URL
          </button>
          <div className="flex items-center text-center my-4">
            <span className="flex-1 border-b border-gray-400"></span>
            <span className="mx-4 md:text-lg sm:text-base">or</span>
            <span className="flex-1 border-b border-gray-400"></span>
          </div>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded md:px-4 md:py-4 sm:px-3 sm:py-2 px-2 py-2 text-base sm:text-lg md:text-xl "
            onClick={() => setHosting(false)}
            disabled={!userId}
          >
            Join a meeting
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="mb-0 mt-2 text-[#aaaaaa]">Enter meeting ID</p>
          <input
            type="text"
            className="rounded md:px-4 md:py-4 sm:px-3 sm:py-2 px-2 py-2 text-base sm:text-lg md:text-xl  w-full text-black outline-none"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
          />
          <button
            className="bg-[#5270EF] md:px-4 md:py-4 sm:px-3 sm:py-2 px-2 py-2 hover:bg-[#4a6cff] text-white rounded text-base sm:text-lg md:text-xl "
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
            className="bg-gray-700 rounded  md:px-4 md:py-4 sm:px-3 sm:py-2 px-2 py-2 hover:bg-gray-600 text-white text-base sm:text-lg md:text-xl "
            onClick={() => setHosting(true)}
          >
            Host a meeting
          </button>
        </div>
      )}
    </div>
  );
};


export default Login;