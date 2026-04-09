import express from "express"
import { getCurrentUser, updateUserLocation } from "../controllers/user.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { getUsersByRole } from "../controllers/chat.controllers.js"

const userRouter=express.Router()

userRouter.get("/current",isAuth,getCurrentUser)
userRouter.post('/update-location',isAuth,updateUserLocation)
userRouter.get('/role-list',isAuth,getUsersByRole)
export default userRouter