

import cx from "classnames";
import { Mic, Video, PhoneOff, MicOff, VideoOff, MonitorPlay, MonitorStop, Presentation, SquareDashedMousePointer } from "lucide-react"; // Add Record icon

import styles from "@/component/Bottom/index.module.css";

const Bottom = (props) => {
  const { 
    muted, 
    playing, 
    toggleAudio, 
    toggleVideo, 
    startScreenShare,
    takeScreenshot,
    leaveRoom, 
    onRecordingToggle, 
    isRecording 
  } = props;

  return (
    <div className={styles.bottomMenu}>
      {muted ? (
        <MicOff
          className={cx(styles.icon, styles.active)}
          size={55}
          onClick={toggleAudio}
        />
      ) : (
        <Mic className={styles.icon} size={55} onClick={toggleAudio} />
      )}
      {playing ? (
        <Video className={styles.icon} size={55} onClick={toggleVideo} />
      ) : (
        <VideoOff
          className={cx(styles.icon, styles.active)}
          size={55}
          onClick={toggleVideo}
        />
      )}
      <PhoneOff size={55} className={cx(styles.icon)} onClick={leaveRoom} />

           <button 
        className={styles.icon} 
        onClick={startScreenShare}
      >
        <Presentation size={23} />
      </button>

      <button 
        className={styles.icon} 
        onClick={takeScreenshot}
      >
        <SquareDashedMousePointer size={23} />
      </button>
      
      <button 
        className={cx(styles.icon, isRecording ? styles.active : "")} 
        onClick={onRecordingToggle}
      >
        {isRecording ? <MonitorStop size={26} /> : <MonitorPlay size={23} />} 
      </button>
    </div>
  );
};

export default Bottom;
