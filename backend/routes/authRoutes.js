import express from 'express'
import { createUser, getUserInfo, login, logout } from '../controllers/userController.js'
import getUserId from '../middlewares/getUserId.js'

const authRouter = express.Router()

authRouter.post('/create-user', createUser)
authRouter.post('/login', login)
authRouter.post('/logout', getUserId, logout)
authRouter.get('/get-user-info', getUserId, getUserInfo)

export default authRouter