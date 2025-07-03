import { config } from 'dotenv';

config();

export const JWT_SECRET = process.env.JWT_SECRET || '123456'
export const PORT = process.env.PORT || '3000'