import express from "express";
import { Login, signUp, Logout, forgotPassword, resetPassword } from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp)
authRouter.post("/signin", Login)
authRouter.get("/logout", Logout)
authRouter.post("/forgot-password", forgotPassword)
authRouter.post("/reset-password/:token", resetPassword)
export default authRouter;