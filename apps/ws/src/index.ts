import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from  "@repo/common/config"

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, request) => {
  const url = request.url
  const queryParms = new URLSearchParams(url?.split('?')[1])
  const token = queryParms.get('token');

  const decoded = jwt.verify(token as string, JWT_SECRET as string);

  if (typeof(decoded) == "string"){
    return
  }

  if (!decoded || !decoded.userId) {
    ws.close(1008, 'Invalid token');
    console.error('Invalid token provided');
    return;
  }

  console.log('New client connected');

  ws.on('message', (message) => {
    
    console.log(`Received message: ${message}`);
    // Echo the message back to the client
    ws.send(`Server received: ${message}`);
  });

  ws.on('ping', () => {
    console.log('Received ping from client');
    // Optionally, you can send a pong response
    ws.pong();
  });
  
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});