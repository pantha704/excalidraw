import axios from 'axios'
import { BACKEND_URL, WS_URL } from '../../config'
import ChatRoom from '../../../components/ChatRoom'

const getRoomId = async (slug:string) => {
    const response = await axios.get(BACKEND_URL+"/room/"+slug)
    return response.data.roomId
} 

export default async function ChatRoomPage({params}: {params:{slug: string}}) {
    
    const slug = (await params).slug
    const roomId = await getRoomId(slug)

    return <ChatRoom id={roomId}/>
}