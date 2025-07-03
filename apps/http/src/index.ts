import express from 'express';
import { config as cfg } from 'dotenv';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middleware';
import { JWT_SECRET, PORT } from "@repo/common/config"
import { CreateRoomSchema, SignInSchema, CreateUserSchema } from '@repo/common/types';

cfg(); // Load environment variables from .env file



const app = express();


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('signup', (req, res) => {

  const data = CreateUserSchema.safeParse(req.body);
  if (!data.success) {
    res.json({message: "Incorrect inputs"})
    return;
  }

  res.send('Signup Complete');
});

app.get('/login', (req, res) => {
  res.send('Login Page');

  const userId = 1
  const token = jwt.sign({ user: userId }, JWT_SECRET as string, { expiresIn: '1h' }, (err, token) => {
    if (err) {
      return res.status(500).send('Error signing token');
    }

    console.log(token);
    res.json({ token });
  });
  
});

app.get('/create-room',authMiddleware , (req, res) => {
  res.send('Create Room');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});