import { useState, useEffect } from "react";
import { useSocket } from "../../context/socket";
import styles from "./index.module.css";
import { Download, Forward } from 'lucide-react';
import { useChat } from "../../context/chat";
import { useUsername } from "../../context/username";

const Chat = ({ username, myId, roomId, isSavedChat, customChat, chatOpen, setCustomChat, setOpenComponent, isChatVisible, setChatVisible}) => {
  const {socket} = useSocket(); 
  useEffect(() => {
    if (socket) {
        console.log("Socket connected in Room component", socket);
    }
}, [socket]);


  const { messages, addMessage } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const { userId } = useUsername();
  console.log(userId)

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message, senderName, senderId) => {
      addMessage(message, senderName, senderId);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    socket.emit("chat-message", {roomId, message:newMessage, senderName:username, senderId:userId});
    addMessage(newMessage,username,  userId);
    setNewMessage("");
  };

  const chatMessages = isSavedChat && customChat ? customChat : messages;
  console.log(chatMessages)

  const handleDownload = () => {
    if (!customChat || customChat.length === 0) return;
  
    const chatContent = customChat.map(msg => `${msg.senderName}: ${msg.message}`).join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chat_${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <p 
        className="mr-2 cursor-pointer"
        onClick={()=>{
          if(customChat){
            setOpenComponent(null);
            setCustomChat(null);
          }
          else if(isChatVisible){
            setChatVisible(false)
          }
        }}>x</p>
        <h2>Group Chat</h2>
        {(isSavedChat) && (
          <div onClick={() => handleDownload()}>
            <Download />
          </div>
        )}
      </div>

      {(isSavedChat && customChat.length === 0) && (<div className="text-white text-lg my-5">No chat in the meeting</div>)}

      <div className={styles.chatMessages}>
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.senderId === userId ? styles.justifyEnd : ""}`}
          >
            {msg.senderId !== userId && <div className={styles.senderName}>{msg.senderName}</div>}
            <div
              className={`${styles.messageContent} ${
                msg.senderId === userId  ? styles.senderMessage : styles.receiverMessage
              }`}
            >
              <span>{msg.message}</span>
              <div className={(msg.senderId === userId  ? styles.messageTimestampsender : styles.messageTimestampreceiver)}>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!isSavedChat) && (
        <form onSubmit={handleSendMessage} className={styles.chatInput}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className={styles.inputField}
          />
          <button type="submit" className={styles.sendButton}>
            <Forward />
          </button>
        </form>
      )}
    </div>
  );
};

export default Chat;
