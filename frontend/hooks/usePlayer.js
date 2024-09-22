
import { useState } from 'react';
import { cloneDeep } from 'lodash';
import { useSocket } from '@/context/socket';
import { useRouter } from 'next/router';

const usePlayer = (myId, roomId, peer, stream) => {
  const socket = useSocket();
  const [players, setPlayers] = useState({});
  const router = useRouter();

  const playerHighlighted = players[myId];
  const nonHighlightedPlayers = { ...players };
  delete nonHighlightedPlayers[myId];

  const leaveRoom = () => {
    socket.emit('user-leave', myId, roomId);
    console.log("Leaving room", roomId);
    peer?.disconnect();
    router.push('/');
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
  

  const takeScreenshot = () => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'screenshot.png';
      link.click();
    } else {
      console.error("No video element found.");
    }
  };

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const startRecording = () => {
    if (!stream) {
      console.error("No stream available for recording.");
      return;
    }
    const newMediaRecorder = new MediaRecorder(stream);
    newMediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => prev.concat(event.data));
      }
    };
    newMediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.webm';
      a.click();
      setRecordedChunks([]);
    };
    newMediaRecorder.start();
    setMediaRecorder(newMediaRecorder);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  return {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    takeScreenshot,
    startRecording,
    stopRecording,
  };
};

export default usePlayer;
