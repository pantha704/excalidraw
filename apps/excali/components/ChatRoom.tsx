import axios from 'axios';
import { BACKEND_URL } from '../app/config';
import ChatRoomClient from './ChatRoomClient';

const getChats = async (roomId: string) => {
    const response = await axios.get(BACKEND_URL+"/chats/"+roomId)
    return response.data.chats
}

const ChatRoom = async ({id}:{id: string}) => {
  const chats = await getChats(id)

  return <ChatRoomClient chats={chats} id={id}/>
}

export default ChatRoom