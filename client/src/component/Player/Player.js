
import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import cx from "classnames";
import { Mic, MicOff, UserSquare2, Scan } from "lucide-react";

import styles from "./index.module.css";

const Player = (props) => {
  const { url, muted, playing, isActive, onStopSharing, username } = props;

  const playerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false); 
  const [isHovering, setIsHovering] = useState(false); 
  const handleStopSharing = () => {
    if (onStopSharing) {
      onStopSharing();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen(); 
    } else {
      if (playerRef.current) {
        playerRef.current.requestFullscreen(); 
      }
    }
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={cx(styles.playerContainer, {
        [styles.notActive]: !isActive,
        [styles.active]: isActive,
        [styles.notPlaying]: !playing,
        [styles.fullscreen]: isFullscreen, 
      })}
      ref={playerRef} 
      onMouseEnter={() => setIsHovering(true)} 
      onMouseLeave={() => setIsHovering(false)} 
    >
      {playing ? (
        <ReactPlayer
          url={url}
          muted={muted}
          playing={playing}
          width="100%"
          height="100%"
          className={styles.reactPlayer}
        />
      ) : (
        <UserSquare2 className={styles.userIcon} size={isActive ? 400 : 200} />
      )}

      {isHovering && (
        <Scan 
          className={styles.enlargeIcon} 
          
          onClick={toggleFullscreen} 
        />
      )}

      <div className={styles.username}>
        {username}
      </div>

      {!isActive ? (
        muted ? (
          <MicOff className={styles.icon} />
        ) : (
          <Mic className={styles.icon} />
        )
      ) : undefined}
    </div>
  );
};

export default Player;
