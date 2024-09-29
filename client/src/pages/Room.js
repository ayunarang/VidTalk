import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../context/socket";
import usePeer from "../hooks/usePeer";
import useMediaStream from "../hooks/useMediaStream";
import usePlayer from "../hooks/usePlayer";

import Player from "../component/Player/Player";
import Bottom from "../component/Bottom/Bottom";

import styles from "../styles/room.module.css";
import { useUsername } from "../context/username";
import Chat from "../component/Chat/Chat";
import Notes from "../component/Notes/Notes";
import ParticipantList from "../component/ParticipantList/ParticipantList";
import { useNavigate, useParams } from "react-router-dom";

const Room = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { peer, myId } = usePeer();
  const { stream, setStream } = useMediaStream();
  const { username, userId } = useUsername();


  const {
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
  } = usePlayer(myId, roomId, peer, stream);

  const [isRecording, setIsRecording] = useState(false);
  const [users, setUsers] = useState({});
  const [usernames, setUsernames] = useState({});
  const originalStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (stream && !originalStreamRef.current) {
      originalStreamRef.current = stream;
      console.log("Original camera stream initialized.");
    }
  }, [stream]);

  const handleStartStopRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording(!isRecording);
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = screenStream;
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      console.log("Screen share started:", screenVideoTrack.label);

      Object.values(users).forEach((call) => {
        const sender = call.peerConnection.getSenders().find(
          (s) => s.track.kind === "video"
        );
        if (sender) {
          sender.replaceTrack(screenVideoTrack);
          console.log(`Replaced video track for user: ${call.peer}`);
        }
      });

      setPlayers((prevPlayers) => ({
        ...prevPlayers,
        [myId]: {
          ...prevPlayers[myId],
          url: screenStream,
          screenShare: true,
        },
      }));

      socket.emit("screen-share", roomId, myId);
      console.log("Emitted 'screen-share' event.");

      screenVideoTrack.onended = () => {
        console.log("Screen share track ended via browser.");
        stopScreenShare();
      };

      setIsScreenSharing(true);

      console.log("Screen sharing started.");
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  const stopScreenShare = () => {
    console.log("Stopping screen share.");
    const originalStream = originalStreamRef.current;

    if (!originalStream) {
      console.error("Original camera stream not found.");
      return;
    }

    const originalVideoTrack = originalStream.getVideoTracks()[0];
    console.log("Original camera track:", originalVideoTrack.label);

    Object.values(users).forEach((call) => {
      const sender = call.peerConnection.getSenders().find(
        (s) => s.track.kind === "video"
      );
      if (sender) {
        sender.replaceTrack(originalVideoTrack);
        console.log(`Reverted video track for user: ${call.peer}`);
      }
    });

    setPlayers((prevPlayers) => ({
      ...prevPlayers,
      [myId]: {
        ...prevPlayers[myId],
        url: originalStream,
        screenShare: false,
      },
    }));

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      console.log("Screen stream stopped and cleared.");
    }

    socket.emit("screen-share-stop", roomId, myId);
    console.log("Emitted 'screen-share-stop' event.");

    setIsScreenSharing(false);

    console.log("Screen sharing stopped.");
  };


  const handleParticipantJoined = useCallback(async (dbId) => {
    try {
      const response = await fetch('http://localhost:5000/api/meetings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dbId, roomId }),
      });
  
      if (!response.ok) {
        throw new Error(`Error adding user: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Failed to add user to the database:', error);
    }
  }, [roomId]); 
  
  useEffect(() => {
    if (!socket || !peer || !stream) return;
  
    const handleUserConnected = (newUserId, newUsername, dbId) => {
      console.log(`User connected: ${newUsername} (${newUserId}) in room ${roomId}`);
  
      setUsernames((prev) => ({
        ...prev,
        [newUserId]: newUsername,
      }));
  
      handleParticipantJoined(dbId);
  
      const call = peer.call(newUserId, stream, { metadata: { username: username } });
  
      call.on("stream", (incomingStream) => {
        console.log(`Incoming stream from ${newUsername} (${newUserId})`);
        setPlayers((prev) => ({
          ...prev,
          [newUserId]: {
            url: incomingStream,
            muted: true,
            playing: true,
            screenShare: false,
            username: newUsername,
          },
        }));
  
        setUsers((prev) => ({
          ...prev,
          [newUserId]: call,
        }));
      });
  
      call.on("error", (err) => {
        console.error(`Call error with user ${newUserId}:`, err);
      });
    };
  
    socket.on("user-connected", handleUserConnected);
  
    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream, roomId, handleParticipantJoined, username]); 
  

  useEffect(() => {
    if (!socket) return;

    const handleToggleAudio = (userId) => {
      console.log(`User with ID ${userId} toggled audio`);
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          muted: !prev[userId].muted,
        },
      }));
    };

    const handleToggleVideo = (userId) => {
      console.log(`User with ID ${userId} toggled video`);
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          playing: !prev[userId].playing,
        },
      }));
    };

    const handleScreenShareEvent = (userId) => {
      console.log(`User with ID ${userId} started screen sharing`);
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          screenShare: true,
        },
      }));
    };

    const handleScreenShareStopEvent = (userId) => {
      console.log(`User with ID ${userId} stopped screen sharing`);
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          screenShare: false,
        },
      }));
    };

    const handleUserLeave = (userId, username) => {
      console.log(`User ${username} (${userId}) is leaving the room`);
      users[userId]?.close();
      setPlayers((prevPlayers) => {
        const { [userId]: _, ...remainingPlayers } = prevPlayers;
        return remainingPlayers;
      });
      setUsers((prevUsers) => {
        const { [userId]: _, ...remainingUsers } = prevUsers;
        return remainingUsers;
      });
      setUsernames((prev) => {
        const { [userId]: _, ...remainingUsernames } = prev;
        return remainingUsernames;
      });
    };



    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("screen-share", handleScreenShareEvent);
    socket.on("screen-share-stop", handleScreenShareStopEvent);
    socket.on("user-leave", handleUserLeave);


    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("screen-share", handleScreenShareEvent);
      socket.off("screen-share-stop", handleScreenShareStopEvent);
      socket.off("user-leave", handleUserLeave);

    };
  }, [socket, users, setPlayers]);

  useEffect(() => {
    if (!peer || !stream) return;

    peer.on("call", (call) => {
      const callerId = call.peer;

      const callerUsername = call.metadata?.username || "Unknown";


      console.log(`Incoming call from ${callerUsername} (${callerId})`);
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        console.log(`Incoming stream from ${callerUsername} (${callerId})`);

        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: true,
            playing: true,
            screenShare: false,
            username: callerUsername,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));

        setUsernames((prev) => ({
          ...prev,
          [callerId]: callerUsername,
        }));
      });

      call.on("error", (err) => {
        console.error(`Call error with user ${callerId}:`, err);
      });
    });
  }, [peer, setPlayers, stream, usernames]);



  useEffect(() => {
    if (!stream || !myId) return;
    console.log(`Setting my stream (${myId})`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true,
        screenShare: false,
        username: "You",
      },
    }));
    originalStreamRef.current = stream;
  }, [myId, setPlayers, stream]);

  const [isChatVisible, setChatVisible] = useState(false);
  const [isNotesVisible, setisNotesVisible] = useState(false);

  const toggleChat = () => {
    setChatVisible((prev) => !prev);
  };

  const toggleNotes = () => {
    setisNotesVisible((prev) => !prev);
  };

  const inactivePlayersCount = Object.keys(nonHighlightedPlayers).length;
  const translationPercentage = inactivePlayersCount === 0 ? '14%' : '10%'; 
  const participants = [

    { id: myId, username: username },

    ...Object.keys(users).map((userId) => ({
      id: userId,
      username: usernames[userId] || "Unknown User",
    })),
  ];


  return (
    <div className="bg-[#1E1F22]">
      <div className={styles.topBar}>
        <h1
          onClick={() => navigate("/")}
          className={styles.logo}>VIDTALK</h1>
      </div>

      <div
        style={{
          display: 'flex',
          transition: 'transform 0.5s ease-in-out',
          transform: isChatVisible ? `translateX(${translationPercentage})` : 'translateX(25%)', 
          maxHeight: '70%',
          marginTop: '5rem',
        }}
        className={styles.activePlayerContainer}
      >
        {playerHighlighted && (
          <Player
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            isActive
            screenShare={playerHighlighted.screenShare}
            username={playerHighlighted.username}
          />
        )}
      </div>

      <div
        style={{
          right: isChatVisible ? '380px' : '30px',
          transition: 'right 0.5s ease-in-out',
        }}
        className={styles.inActivePlayerContainer}
      >
        {Object.keys(nonHighlightedPlayers).map((playerId) => {
          const { url, muted, playing, screenShare, username } = nonHighlightedPlayers[playerId];
          return (
            <Player
              key={playerId}
              url={url}
              muted={muted}
              playing={playing}
              isActive={false}
              screenShare={screenShare}
              username={username} 
            />
          );
        })}
      </div>

      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        startScreenShare={handleScreenShare}
        takeScreenshot={takeScreenshot}
        onRecordingToggle={handleStartStopRecording}
        isRecording={isRecording}
        isScreenSharing={isScreenSharing}
        leaveRoom={leaveRoom}
        toggleChat={toggleChat}
        isChatVisible={isChatVisible}
        roomId={roomId}
        isNotesVisible={isNotesVisible}
        toggleNotes={toggleNotes}
      />

      <div
        className={`absolute right-0 top-0 bottom-0 w-96 h-full bg-white shadow-lg z-50 transition-transform duration-700 ease-in-out transform ${isChatVisible ? "translate-x-0" : "translate-x-full"}`}
        style={{ overflowY: 'auto' }} 
      >
        <Chat username={username} myId={myId} roomId={roomId} />
      </div>

      <ParticipantList participants={participants} username={username} />

      {isNotesVisible ? <Notes isNotesVisible={isNotesVisible} setisNotesVisible={setisNotesVisible} /> : null}
    </div>
  );


};

export default Room;