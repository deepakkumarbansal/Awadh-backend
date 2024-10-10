import express from "express";
const authRoutes = express.Router();
import { changeName, changePassword, forgetPassword, login, register, updateAvatarUrl, verifyEmailLinkAndUpdate } from "../controllers/auth.controller.js";

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post('/forget').post(forgetPassword);
authRoutes.post('/verifypassword').post(verifyEmailLinkAndUpdate);
authRoutes.post('/changePassword', changePassword);
authRoutes.post('/changeName', changeName);
authRoutes.post('/update-avatar-url', updateAvatarUrl)

export default authRoutes;
