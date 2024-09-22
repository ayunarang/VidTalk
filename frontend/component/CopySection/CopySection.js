import { CopyToClipboard } from "react-copy-to-clipboard";
import { Copy , CheckCheck } from "lucide-react";

import styles from "@/component/CopySection/index.module.css";
import { useState } from "react";

const CopySection = (props) => {
  const { roomId } = props;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => {
        setIsCopied(false);
    }, 8000); 
};

const truncatedRoomId = roomId.length > 15 ? `${roomId.slice(0, 15)}...` : roomId;

  return (
    <div className={styles.copyContainer}>
      <div className={styles.copyHeading}>Copy Room ID:</div>
      <hr />
      <div className={styles.copyDescription}>
      <span>{truncatedRoomId}</span>
            <CopyToClipboard text={roomId} onCopy={handleCopy}>
                {isCopied ? (
                    <CheckCheck className="ml-3 cursor-pointer text-green-500" />
                ) : (
                    <Copy className="cursor-pointer" />
                )}
            </CopyToClipboard>
      </div>
    </div>
  );
};

export default CopySection;