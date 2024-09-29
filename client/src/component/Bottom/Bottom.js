import cx from "classnames";
import {
  Mic,
  Video,
  MicOff,
  VideoOff,
  MonitorPlay,
  MonitorStop,
  Presentation,
  SquareDashedMousePointer,
  Copy,
  CheckCheck,
  MessageSquareText,
  NotebookPen
} from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react";
import styles from "./index.module.css";

const Bottom = (props) => {
  const {
    muted,
    playing,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    takeScreenshot,
    leaveRoom,
    isRecording,
    toggleChat,
    isChatVisible,
    isNotesVisible, 
toggleNotes, 
    roomId,
  } = props;

  const [isCopied, setIsCopied] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(!muted); 
  const [isVideoActive, setIsVideoActive] = useState(playing); 
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatActive, setIsChatActive] = useState(isChatVisible); 
  const [IsNotesActive, setIsNotesActive] = useState(isNotesVisible);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 8000);
  };

  const truncatedRoomId = roomId?.length > 15 ? `${roomId.slice(0, 10)}..` : roomId;

  const handleToggleAudio = () => {
    toggleAudio();
    setIsAudioActive((prev) => !prev);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoActive((prev) => !prev);
  };

  const handleToggleChat = () => {
    toggleChat();
    setIsChatActive((prev) => !prev); 
  };

  const handleStartScreenShare = () => {
    startScreenShare();
    setIsScreenSharing((prev) => !prev);
  };

  const handleToggleNotes=()=>{
    toggleNotes();
    setIsNotesActive((prev) => !prev); 
  }

  return (
    <div
      className={styles.bottomMenu}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        marginTop: "2rem",
        transform: isChatVisible ? "translateX(-70%)" : "translateX(-52.5%)",
        transition: "transform 0.5s ease-in-out",
        display: "flex",
        justifyContent: "space-between", 
      }}
    >
      <div className={cx(styles.copySection, styles.button)}>
        <CopyToClipboard text={roomId} onCopy={handleCopy}>
          <div className="flex items-center cursor-pointer">
            <span className="cursor-pointer">{truncatedRoomId}</span>
            {isCopied ? (
              <CheckCheck className="ml-3" />
            ) : (
              <Copy className="ml-3 cursor-pointer" />
            )}
          </div>
        </CopyToClipboard>
      </div>

      {isAudioActive ? (
                <MicOff
                className={cx(styles.icon)}
                size={30}
                onClick={handleToggleAudio}
              />
      ) : (

        <Mic
        className={cx(styles.icon, isAudioActive && styles.active)}
        size={30}
        onClick={handleToggleAudio}
      />
      )}

      {isVideoActive ? (
        <Video
          className={cx(styles.icon, isVideoActive && styles.active)}
          size={30}
          onClick={handleToggleVideo}
        />
      ) : (
        <VideoOff
          className={cx(styles.icon)}
          size={30}
          onClick={handleToggleVideo}
        />
      )}

      <MessageSquareText
        className={cx(styles.icon, isChatActive && styles.active)}
        onClick={handleToggleChat}
      />

            <NotebookPen
        className={cx(styles.icon, IsNotesActive && styles.active)}
        onClick={handleToggleNotes}
      />

      <Presentation
        size={30}
        className={cx(styles.icon, isScreenSharing && styles.active)}
        onClick={handleStartScreenShare}
      />

      <SquareDashedMousePointer
        className={styles.icon}
        size={30}
        onClick={takeScreenshot}
      />


      <span
        className={cx(styles.leaveSection, styles.button)}
        onClick={leaveRoom}
      >
        End Call
      </span>
    </div>
  );
};

export default Bottom;
