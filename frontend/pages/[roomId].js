import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";

import Player from "@/component/Player/Player";
import Bottom from "@/component/Bottom/Bottom";
import CopySection from "@/component/CopySection/CopySection";

import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";
import { useUsername } from "@/context/username";
import Chat from "@/component/Chat/Chat";
import Notes from "@/component/Notes/Notes";
import ParticipantList from "@/component/ParticipantList/ParticipantList";

const Room = () => {
  const socket = useSocket();
  const router = useRouter();
  const { roomId } = router.query;
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

      Object.values(users).forEach((call) => {
        const sender = call.peerConnection.getSenders().find(
          (s) => s.track.kind === "video"
        );
        if (sender) {
          sender.replaceTrack(screenVideoTrack);
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

      screenVideoTrack.onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  const stopScreenShare = () => {
    const originalStream = originalStreamRef.current;

    if (!originalStream) {
      return;
    }

    const originalVideoTrack = originalStream.getVideoTracks()[0];

    Object.values(users).forEach((call) => {
      const sender = call.peerConnection.getSenders().find(
        (s) => s.track.kind === "video"
      );
      if (sender) {
        sender.replaceTrack(originalVideoTrack);
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
    }

    socket.emit("screen-share-stop", roomId, myId);

    setIsScreenSharing(false);
  };

  const handleParticipantJoined = async (dbId) => {
    try {
      const response = await fetch('/api/meetings/add', {
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
    } catch (error) {
      console.error('Failed to add user to the database:', error);
    }
  };

  useEffect(() => {
    if (!socket || !peer || !stream) return;

    const handleUserConnected = (newUserId, newUsername, dbId) => {
      setUsernames((prev) => ({
        ...prev,
        [newUserId]: newUsername,
      }));

      handleParticipantJoined(dbId);

      const call = peer.call(newUserId, stream, { metadata: { username: username } });

      call.on("stream", (incomingStream) => {
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
  }, [peer, setPlayers, socket, stream, roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleToggleAudio = (userId) => {
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          muted: !prev[userId].muted,
        },
      }));
    };

    const handleToggleVideo = (userId) => {
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          playing: !prev[userId].playing,
        },
      }));
    };

    const handleScreenShareEvent = (userId) => {
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          screenShare: true,
        },
      }));
    };

    const handleScreenShareStopEvent = (userId) => {
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          screenShare: false,
        },
      }));
    };

    const handleUserLeave = (userId, username) => {
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

      call.answer(stream);

      call.on("stream", (incomingStream) => {
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

  const handleLeaveRoom = async () => {
    await leaveRoom();
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <ParticipantList players={players} usernames={usernames} />
      <div className={styles.mainContent}>
        <Player players={players} />
        <Bottom
          onLeaveRoom={handleLeaveRoom}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onStartStopRecording={handleStartStopRecording}
          isRecording={isRecording}
          onScreenShare={handleScreenShare}
          isScreenSharing={isScreenSharing}
        />
      </div>
      <Chat />
      <Notes />
      <CopySection />
    </div>
  );
};

export default Room;
