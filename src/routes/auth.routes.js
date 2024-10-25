import express from "express";
const authRoutes = express.Router();
import { changeName, changePassword, forgetPassword, login, register, updateAvatarUrl, verifyEmailLinkAndUpdate, acceptInviteForReporter, } from "../controllers/auth.controller.js";

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post('/forget',forgetPassword);
authRoutes.post('/verifypassword',verifyEmailLinkAndUpdate);
authRoutes.post('/changePassword', changePassword);
authRoutes.post('/changeName', changeName);
authRoutes.post('/update-avatar-url', updateAvatarUrl);
authRoutes.post("/accept-invite-reporter/:token", acceptInviteForReporter);

export default authRoutes;
