import { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useSocket } from '@/context/socket';
import { useRouter } from 'next/router';
import { useUsername } from '@/context/username';
import { useChat } from '@/context/chat';
import { useNotes } from '@/context/notes';
import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';


const usePlayer = (myId, roomId, peer, stream) => {
  const {socket} = useSocket();
  const [players, setPlayers] = useState({});
  const router = useRouter();
  const { userId, host } = useUsername();
  const { messages } = useChat();
  const {note} =useNotes();

  const playerHighlighted = players[myId];
  const nonHighlightedPlayers = { ...players };
  delete nonHighlightedPlayers[myId];


  const handleUserLeave = async (note) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, messages , note}),
      });

      if (response.ok) {
        console.log(response.data);
        console.log("User successfully left the room");
        socket.emit('user-leave', myId, roomId);
        console.log("Leaving room", roomId);
        peer?.disconnect();
        router.push('/meetingsDashboard');
      } else {
        console.error('Failed to leave room:', await response.json());
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  const sanitizeHtml = (htmlContent) => {
    return DOMPurify.sanitize(htmlContent);
};


  const leaveRoom = () => {
    console.log(note);

    const sanitizedNote= sanitizeHtml(note);
    console.log(sanitizedNote);
      handleUserLeave(sanitizedNote);
      socket.emit('user-leave', myId, roomId);
      console.log("Leaving room", roomId);
      peer?.disconnect();
      router.push('/meetingsDashboard');
  };


  const toggleAudio = () => {
    console.log("I toggled my audio");
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        ...prev[myId],
        muted: !prev[myId].muted,
      },
    }));
    socket.emit('user-toggle-audio', myId, roomId);
  };

  const toggleVideo = () => {
    console.log("I toggled my video");
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        ...prev[myId],
        playing: !prev[myId].playing,
      },
    }));
    socket.emit('user-toggle-video', myId, roomId);
  };

    const [isClient, setIsClient] = useState(false);
  
    useEffect(() => {
      setIsClient(true);
    }, []);
  
    const takeScreenshot = async () => {
      if (!isClient) return;
  
      const element = document.body; 
  
      try {
        const canvas = await html2canvas(element, {
          useCORS: true, 
        });
        const dataURL = canvas.toDataURL('image/png');
  
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'screenshot.png';
        link.click();
      } catch (error) {
        console.error("Error taking screenshot:", error);
      }

    }
  return {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    takeScreenshot,
  };
};

export default usePlayer;
