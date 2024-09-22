import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'

import styles from '@/styles/home.module.css'
import { useState } from 'react';

export default function Home() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')

  const createAndJoin = () => {
    const roomId = uuidv4()
    router.push(`/${roomId}`)
  }

  const joinRoom = () => {
    if (roomId) router.push(`/${roomId}`)
    else {
      alert("Please provide a valid room id")
    }
  }
  return (
    <div className="flex-col justify-center text-center my-10 mx-auto border-white border w-4/12 p-10">
      <h1 className="text-5xl font-bold mb-10">VidTalk</h1>
      <div className="flex flex-col gap-4 max-w-80 justify-center mx-auto my-5">
        <h1 className="text-xl font-bold">Host a meeting</h1>
        <button className="px-4 py-2 rounded bg-blue-300  text-black font-semibold max-w-48 mx-auto"
          onClick={createAndJoin}>Create meeting URL</button>
      </div>
      <div class="flex items-center text-center">
        <span class="flex-1 border-b border-white mx-2"></span>
        <span>or</span>
        <span class="flex-1 border-b border-white mx-2"></span>
      </div>

      <div className="flex flex-col gap-4 max-w-80 justify-center mx-auto my-5">
        <h1 className="text-xl font-bold">Join a meeting</h1>
        <input type="text" label="Enter meeting URL" 
        className=" px-4 py-2 w-auto rounded text-black outline-none" 
        onChange={(e) => setRoomId(e.target.value)}
        value={roomId}
        />
        <button
        onClick={joinRoom}
          className="px-4 py-2 rounded  bg-blue-300 text-black font-semibold max-w-48 mx-auto">
          
          Join meeting</button>
      </div>
    </div>
  )
}
