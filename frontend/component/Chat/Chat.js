import { useState, useEffect } from "react";
import { useSocket } from "@/context/socket";
import styles from "@/component/Chat/index.module.css";
import { Download, Forward } from 'lucide-react';
import { useChat } from "@/context/chat";
import { useUsername } from "@/context/username";

const Chat = ({ username, myId, roomId, isSavedChat, customChat, chatOpen }) => {
  const socket = useSocket();
  const { messages, addMessage } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const { userId } = useUsername();

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message, sender, userId) => {
      addMessage(message, sender, userId);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    socket.emit("chat-message", roomId, newMessage, username, userId);
    addMessage(newMessage, username, userId);
    setNewMessage("");
  };

  const chatMessages = isSavedChat && customChat ? customChat : messages;
  console.log(chatMessages)

  const handleDownload = () => {
    if (!customChat || customChat.length === 0) return;
  
    const chatContent = customChat.map(msg => `${msg.sender}: ${msg.message}`).join('\n');
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
            className={`${styles.message} ${msg.sender === username ? styles.justifyEnd : ""}`}
          >
            {msg.sender !== username && <div className={styles.senderName}>{msg.sender}</div>}
            <div
              className={`${styles.messageContent} ${
                msg.sender === username ? styles.senderMessage : styles.receiverMessage
              }`}
            >
              <span>{msg.message}</span>
              <div className={(msg.sender === username ? styles.messageTimestampsender : styles.messageTimestampreceiver)}>
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
