
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

const Room = () => {
  const socket = useSocket();
  const router = useRouter();
  const { roomId } = router.query;
  const { peer, myId } = usePeer();
  const { stream, setStream } = useMediaStream();
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

      //1. Replace video tracks in all peer connections with screenVideoTrack
      Object.values(users).forEach((call) => {
        const sender = call.peerConnection.getSenders().find((s) => s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(screenVideoTrack);
          console.log(`Replaced video track for user: ${call.peer}`);
        }
      });

      // 2.Update the local player's stream to the screen stream
      setPlayers((prevPlayers) => ({
        ...prevPlayers,
        [myId]: {
          ...prevPlayers[myId],
          url: screenStream, 
          screenShare: true,
        },
      }));

      // Do not modify the main stream to keep it as the camera stream

      socket.emit("screen-share", roomId, myId);
      console.log("Emitted 'screen-share' event.");

      // 3.Listen for when the user stops sharing the screen via the browser's own button
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

    // Replace video tracks in all peer connections with originalVideoTrack
    Object.values(users).forEach((call) => {
      const sender = call.peerConnection.getSenders().find((s) => s.track.kind === "video");
      if (sender) {
        sender.replaceTrack(originalVideoTrack);
        console.log(`Reverted video track for user: ${call.peer}`);
      }
    });

    // Update the local player's stream back to original camera stream
    setPlayers((prevPlayers) => ({
      ...prevPlayers,
      [myId]: {
        ...prevPlayers[myId],
        url: originalStream, 
        screenShare: false,
      },
    }));

    // Stop the screen stream tracks
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

  const getVideoSender = () => {
    const userCalls = Object.values(users);
    for (const call of userCalls) {
      const sender = call.peerConnection
        .getSenders()
        .find((s) => s.track.kind === "video");
      if (sender) {
        return sender;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!socket || !peer || !stream) return;

    const handleUserConnected = (newUser) => {
      console.log(`User connected in room with userId ${newUser}`);
      const call = peer.call(newUser, stream);

      call.on("stream", (incomingStream) => {
        console.log(`Incoming stream from ${newUser}`);
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: true,
            playing: true,
            screenShare: false, 
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });

      call.on("error", (err) => {
        console.error(`Call error with user ${newUser}:`, err);
      });
    };

    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!socket) return;

    const handleToggleAudio = (userId) => {
      console.log(`User with id ${userId} toggled audio`);
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          muted: !prev[userId].muted,
        },
      }));
    };

    const handleToggleVideo = (userId) => {
      console.log(`User with id ${userId} toggled video`);
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          playing: !prev[userId].playing,
        },
      }));
    };

    const handleScreenShareEvent = (userId) => {
      console.log(`User with id ${userId} started screen sharing`);
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          screenShare: true,
        },
      }));
    };

    const handleScreenShareStopEvent = (userId) => {
      console.log(`User with id ${userId} stopped screen sharing`);
      setPlayers((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          screenShare: false,
        },
      }));
    };

    const handleUserLeave = (userId) => {
      console.log(`User ${userId} is leaving the room`);
      users[userId]?.close();
      setPlayers((prevPlayers) => {
        const { [userId]: _, ...remainingPlayers } = prevPlayers;
        return remainingPlayers;
      });
      setUsers((prevUsers) => {
        const { [userId]: _, ...remainingUsers } = prevUsers;
        return remainingUsers;
      });
    };

    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("screen-share", handleScreenShareEvent);
    socket.on("screen-share-stop", handleScreenShareStopEvent); // Listen for screen-share-stop
    socket.on("user-leave", handleUserLeave);

    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("screen-share", handleScreenShareEvent);
      socket.off("screen-share-stop", handleScreenShareStopEvent); 
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users]);

  useEffect(() => {
    if (!peer || !stream) return;

    peer.on("call", (call) => {
      const callerId = call.peer;
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        console.log(`Incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: true,
            playing: true,
            screenShare: false, 
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));
      });

      call.on("error", (err) => {
        console.error(`Call error with user ${callerId}:`, err);
      });
    });
  }, [peer, setPlayers, stream]);

  useEffect(() => {
    if (!stream || !myId) return;
    console.log(`Setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        ...prev[myId],
        url: stream,
        muted: true,
        playing: true,
        screenShare: false, 
      },
    }));
    originalStreamRef.current = stream; 
  }, [myId, setPlayers, stream]);

  return (
    <>
      <div className={styles.activePlayerContainer}>
        {playerHighlighted && (
          <Player
            url={playerHighlighted.url}
            muted={playerHighlighted.muted}
            playing={playerHighlighted.playing}
            isActive
            screenShare={playerHighlighted.screenShare} 
          />
        )}
      </div>
      <div className={styles.inActivePlayerContainer}>
        {Object.keys(nonHighlightedPlayers).map((playerId) => {
          const { url, muted, playing, screenShare } = nonHighlightedPlayers[playerId];
          return (
            <Player
              key={playerId}
              url={url}
              muted={muted}
              playing={playing}
              isActive={false}
              screenShare={screenShare} 
            />
          );
        })}
      </div>
      <CopySection roomId={roomId} />
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
      />
    </>
  );
};

export default Room;
