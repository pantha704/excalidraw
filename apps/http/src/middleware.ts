import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
config(); // Load environment variables from .env file
const JWT_SECRET = process.env.JWT_SECRET as string;

export const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1] || "";
  // console.log(token);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log(decoded);

    // @ts-ignore
    req.userId = decoded.userId; // Attach the decoded user info to the request object

    next();
  } catch (e) {
    res.status(411).json({
      message: "JWT verification failed",
      error: e,
    });
  }
};
