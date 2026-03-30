import express from 'express'
import connectDB from './config/mongoDB.js'
import dotenv from "dotenv";
import cors from 'cors'
import cookieParser from 'cookie-parser';

import http from 'http'
import {Server} from 'socket.io'


import authRouter from './routes/authRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import { registerSockets } from './sockets/index.js';

dotenv.config();
const PORT = 3000
connectDB()

const app = express()

// sockets setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Sockets events:
registerSockets(io);

app.use(cookieParser())
app.use(express.json())
app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true
}));

app.get('/', (req, res)=>{
    res.send('XChat Backend Running')
})

app.use('/api/auth', authRouter)
app.use('/api/rooms', roomRouter)

server.listen(PORT, ()=>{
    console.log('XChat Backend Running on:', PORT)
})