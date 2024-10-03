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
  NotebookPen,
  PhoneOff,
  MoreVertical, 
  MoreHorizontal
} from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useEffect, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false); 

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

  const handleToggleNotes = () => {
    toggleNotes();
    setIsNotesActive((prev) => !prev);
  };

  const handleMoreClick = () => {
    setIsMoreOpen((prev) => !prev); 
  };

  return (
    <div
      className={`${styles.bottomMenu} md:translate-x-[-72%] ${isChatVisible ? 'md:translate-x-[-72%]' : 'md:translate-x-[-56.5%]'} transition-transform duration-500 ease-in-out`}
      style={{
        position: "absolute",
        marginTop: "2rem",
        display: "flex",
        justifyContent: "space-between",
      }}
    >

      {(!isMobile) ? (
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
      ) : (
        <div>
          <CopyToClipboard text={roomId} onCopy={handleCopy}>
            {isCopied ? (
              <CheckCheck className="ml-3" />
            ) : (
              <Copy className="ml-3 cursor-pointer" />
            )}
          </CopyToClipboard>
        </div>
      )}

      <MessageSquareText
        className={cx(styles.icon, isChatActive && styles.active)}
        onClick={handleToggleChat}
      />


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
        <VideoOff
        className={cx(styles.icon)}
        size={30}
        onClick={handleToggleVideo}
      />
      ) : (
        <Video
        className={cx(styles.icon, isVideoActive && styles.active)}
        size={30}
        onClick={handleToggleVideo}
      />
      )}

      {(!isMobile) ? (<NotebookPen
        className={cx(styles.icon, IsNotesActive && styles.active)}
        onClick={handleToggleNotes}
      />) : ''}


      {(!isMobile) ? (<Presentation
        size={30}
        className={cx(styles.icon, isScreenSharing && styles.active)}
        onClick={handleStartScreenShare}
      />) : ''}




      {(!isMobile) ? (<SquareDashedMousePointer
        className={styles.icon}
        size={30}
        onClick={takeScreenshot}
      />) : ''}


      {(!isMobile) ?
        <span
          className={cx(styles.leaveSection, styles.button)}
          onClick={leaveRoom}
        >End Call</span>
        :
        <PhoneOff
          style={{ backgroundColor: '#7e0606' }}
          onClick={leaveRoom}
          size={30}
          className={styles.icon}
        />
      }

      {isMobile && (
        <>
          <MoreHorizontal
            size={30}
            className={cx(styles.icon)}
            onClick={handleMoreClick}
          />
          {isMoreOpen && (
            <div
              className={styles.moreDropdown}
              style={{
                bottom: '50px',
                color: 'white',
                fontSize: '14px',
                backgroundColor: '#252525'
              }}
            >
              <div
                onClick={handleToggleNotes}
                style={{ borderBottom: '1px solid #333' }}
              >
                Display Notes
              </div>
              <div
                onClick={takeScreenshot}
                style={{ borderBottom: '1px solid #333' }}
              >
                Screenshot
              </div>
              <div onClick={handleStartScreenShare}>
                Screenshare
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default Bottom;
