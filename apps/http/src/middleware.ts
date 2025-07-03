import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { config } from 'dotenv';
config(); // Load environment variables from .env file
const JWT_SECRET = process.env.JWT_SECRET


export const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1] || "";
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }   
    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    // @ts-ignore
    req.user = decoded?.user; // Attach the decoded user info to the request object
    next();
}
