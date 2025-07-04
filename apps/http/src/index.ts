import bcrypt from "bcrypt";
import express from "express";
import { config as cfg } from "dotenv";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import { JWT_SECRET, PORT } from "@repo/common/config";
import {
  CreateRoomSchema,
  SignInSchema,
  CreateUserSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

cfg(); // Load environment variables from .env file

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

app.post("/login", async (req, res) => {
  // ZOD
  const parsedData = CreateUserSchema.safeParse(req.body);
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
        yourPass: parsedData?.data.password,
        correctPass: user.password,
      });
      return;
    }

    // JWT
    const token = jwt.sign(
      { userId: user?.id },
      JWT_SECRET as string,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          res.status(500).send("Error signing token");
          return;
        }
        // console.log(token);
        res.json({ token });
      }
    );
  } catch (e) {
    res.json({
      message: "User not found",
      error: e,
    });
  }
});

app.get("/create-room", authMiddleware, (req, res) => {
  res.send("Create Room");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
