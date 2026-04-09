import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import itemRouter from "./routes/item.routes.js"
import shopRouter from "./routes/shop.routes.js"
import orderRouter from "./routes/order.routes.js"
import chatRouter from "./routes/chat.routes.js"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"

const app = express()
const server = http.createServer(app)

// --- UPDATED DEPLOYMENT SETTINGS ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://quickcity-cart.vercel.app",
  "https://quick-city-cart.vercel.app", // Extra check for the dash version
];

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow if no origin (like mobile/postman)
    // 2. Allow if in allowedOrigins list
    // 3. Allow any vercel.app sub-domain (Preview links)
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); // Logs check karne ke liye
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

// Socket.io setup with corrected CORS
const io = new Server(server, {
  cors: corsOptions
})

app.set("io", io)
const port = process.env.PORT || 5000

// CORS Middleware
app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("QuickCity Cart API is running...");
});

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)
app.use("/api/chat", chatRouter)

socketHandler(io)

server.listen(port, () => {
  connectDb()
  console.log(`server started at ${port}`)
})