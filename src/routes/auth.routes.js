import express from "express";
const authRoutes = express.Router();
import { changePassword, forgetPassword, login, register, verifyEmailLinkAndUpdate } from "../controllers/auth.controller.js";

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post('/forget').post(forgetPassword);
authRoutes.post('/verifypassword').post(verifyEmailLinkAndUpdate);
authRoutes.post('/changePassword', changePassword)

export default authRoutes;
