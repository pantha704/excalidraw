'use client'
import React, { useEffect, useState } from 'react'
import { useSocket } from './hooks/useSocket'

const ChatRoomClient = ({chats, id}: {chats: {message: string}[], id: string}) => {
    const [msgs, setMsgs] = useState(chats)
    const [current, setCurrent] = useState("")
    const {loading, socket} = useSocket()

    useEffect(() => {
        console.log("useEffect running for room", id) // Debug log
        if (socket && !loading) {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }))
            socket.onmessage = (event) => {
                console.log("Received message:", event.data) // Debug log
                const parsedData = JSON.parse(event.data) // Fix: Parse event.data directly
                if (parsedData.type === "chat") {
                    setMsgs((c) => [...c, {message: parsedData.message}])
                }
            }
        }
    }, [socket, loading, id])

    console.log("ChatRoomClient rendered for room", id) // Debug log

    return <div>
        {msgs.map((c, index) => <div key={index}>{c.message}</div>)} {/* Added key for list */}
        <input
            type="text"
            placeholder='Any thoughts?'
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
        />
        <button onClick={() => {
            if (current.trim() && socket) { // Prevent empty sends
                const messageObj = {message: current}
                setMsgs((c) => [...c, messageObj]) // Add locally for sender
                socket.send(JSON.stringify({
                    type: 'chat',
                    message: current,
                    roomId: id
                }))
                setCurrent('')
            }
        }}>Send</button>
    </div>
}

export default ChatRoomClient