import express from 'express'; 
import dotenv from 'dotenv';
dotenv.config();
import connectDb from './config/db.js';
import authRouter from './routes/auth.routes.js';
import cors from "cors"
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';
import geminiResponse from './gemini.js';

const app = express()
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);


  
app.listen(port,()=>{
    connectDb()
    console.log("server started on port", port);
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
})
