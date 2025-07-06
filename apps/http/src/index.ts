import bcrypt from "bcrypt";
import express from "express";
import { config as cfg } from "dotenv";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import { PORT } from "@repo/common/config";
import {
  CreateRoomSchema,
  SignInSchema,
  CreateUserSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

cfg(); // Load environment variables from .env file
const JWT_SECRET = process.env.JWT_SECRET as string;

const app = express();
app.use(express.json()); // To parse JSON body

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    res.json({ message: "Incorrect inputs" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(parsedData.data?.password, 10);
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data?.username,
        password: hashedPassword,
        name: parsedData.data?.name ?? "",
        photo: parsedData.data?.photo,
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(411).json({
      message: "User already exists with this username",
      error: e,
    });
  }
});

app.post("/signin", async (req, res) => {
  // ZOD
  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    res.json({ message: "Incorrect inputs" });
    return;
  }

  // PRISMA
  try {
    const user = await prismaClient.user.findFirst({
      where: {
        email: parsedData.data?.username,
      },
    });

    if (!user) {
      res.status(401).json({
        error: "User not found",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      parsedData.data?.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        error: "Invalid password",
      });
      return;
    }

    // JWT
    const token = jwt.sign({ userId: user?.id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (e) {
    res.json({
      message: "User not found",
      error: e,
    });
  }
});

app.post("/create-room", authMiddleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    res.json({ message: "Incorrect inputs" });
    return;
  }

  // Assuming authMiddleware attaches userId to req
  const userId = (req as any).userId;
  // console.log(userId, parsedData.data?.name);

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data?.name,
        adminId: userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(411).json({
      message: "Room already exists or error in creating room",
      error: e,
    });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where: {
      roomId: roomId,
    },
    orderBy: {
      id: "asc",
    },
    take: 50,
  });
  res.json({
    chats: messages, // Passing the chats for a given roomId
  });
});

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: {
      slug: slug,
    },
    select: {
      id: true,
    },
  });
  res.json({
    roomId: room?.id, // Passing the roomId for a given slug
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
