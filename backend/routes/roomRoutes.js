import express from 'express'
import getUserId from '../middlewares/getUserId.js'
import { createRoom, deleteRoom, getRoom, joinRoom } from '../controllers/roomController.js'
const roomRouter = express.Router()

roomRouter.post('/create-room', getUserId, createRoom)
roomRouter.post('/join-room', joinRoom)
roomRouter.get('/get-room/:roomId', getRoom)
roomRouter.delete('/delete-room', getUserId, deleteRoom)


export default roomRouter