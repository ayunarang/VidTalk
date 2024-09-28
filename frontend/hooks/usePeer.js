
import { useSocket } from "@/context/socket";
import { useUsername } from "@/context/username";
import { useRouter } from "next/router";

const { useState, useEffect, useRef } = require("react");

const usePeer = () => {
  const socket = useSocket();
  const router = useRouter();
  const roomId = router.query.roomId;
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const isPeerSet = useRef(false);
  const { username, loggedIn , userId} = useUsername(); 

  useEffect(() => {
    if (isPeerSet.current || !roomId || !socket || !username || !loggedIn) return;
    isPeerSet.current = true;
    
    let myPeer;
    (async function initPeer() {
      myPeer = new (await import('peerjs')).default();
      setPeer(myPeer);

      myPeer.on("open", (id) => {
        console.log(`Your peer ID is ${id}`);
        setMyId(id);
        console.log(`Username in usePeer: ${username}`); 
        socket?.emit("join-room", roomId, id, JSON.stringify(username), userId); 
      });
    })();
  }, [roomId, socket, username]); 

  return {
    peer,
    myId,
  };
};

export default usePeer;
