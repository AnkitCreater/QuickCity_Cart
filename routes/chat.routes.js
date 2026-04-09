import express from 'express'
import { getChatHistory } from '../controllers/chat.controllers.js'
import isAuth from '../middlewares/isAuth.js'

const chatRouter = express.Router()

chatRouter.get('/history', isAuth, getChatHistory)

export default chatRouter
