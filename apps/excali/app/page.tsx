'use client'

import React,{useState} from "react";
import styles from "./page.module.css"

export default function Home() {
  const [roomId, setRoomId] = useState("")

  return (
  <div className="flex w-screen h-screen justify-center items-center">
    <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />

  <button onClick={() => {
    
  }}>Join Room</button>
  </div>
  );
}
