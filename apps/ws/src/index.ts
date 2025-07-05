import { config } from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";

config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || !decoded || !decoded.userId) {
      console.error("Invalid token provided");
      return null;
    }
    return decoded.userId;
  } catch (error) {
    console.error(`Token verification failed: ${error}`);
    return null;
  }
}

// console.log("before connection");

wss.on("connection", (ws, request) => {
  const url = request.url;
  const queryParms = new URLSearchParams(url?.split("?")[1]);
  const token = queryParms.get("token") as string;
  // console.log(token);

  const userId = checkUser(token);

  if (userId == null) {
    ws.close();
    return null;
  }
  // console.log("after connection");

  users.push({
    ws,
    userId,
    rooms: [],
  });

  console.log("New client connected");

  ws.on("message", (message) => {
    let parsedData;
    try {
      parsedData = JSON.parse(message.toString());
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
          format: message.toString(),
        })
      );
      return;
    }

    if (parsedData.type === "join_room") {
      console.log("join_room triggered");
      const user = users.find((x) => x.ws === ws);
      if (user && !user.rooms.includes(parsedData.roomId)) {
        user.rooms.push(parsedData.roomId);
        console.log(`User joined room: ${parsedData.roomId}`);
      }
      console.log("Updated user rooms for " + user?.userId + " :", user!.rooms);
    }

    if (parsedData.type === "leave_room") {
      console.log("leave_room triggered");
      const user = users.find((x) => x.ws === ws);
      user!.rooms = user!.rooms.filter((x) => x !== String(parsedData.roomId));
      console.log("Updated user rooms for " + user?.userId + " :", user!.rooms);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const msg = parsedData.msg;
      const sender = users.find((x) => x.ws === ws);
      if (sender && sender.rooms.includes(roomId)) {
        users.forEach(async (user) => {
          try {
            await prismaClient.chat.create({
              data: {
                roomId: Number(roomId),
                userId: userId,
                message: msg,
              },
            });
          } catch (e) {
            ws.send(
              JSON.stringify({
                message: "Database creation error",
                error: e,
              })
            );
          }
          if (user.rooms.includes(roomId) && user.ws !== ws) {
            user.ws.send(
              JSON.stringify({
                type: "chat",
                message: msg,
                roomId,
              })
            );
          }
        });
      } else {
        ws.send(JSON.stringify({ type: "error", message: "Not in room" }));
      }
    }
    // Echo the message back to the client
    // ws.send(`Server received: ${message}`);
  });

  ws.on("ping", () => {
    console.log("Received ping from client");
    // Optionally, you can send a pong response
    ws.pong();
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
