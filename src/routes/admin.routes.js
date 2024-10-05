import express from "express";
const adminRoutes = express.Router();
import {
  getAllUsers,
  getAllReporters,
  updateStatusOfUser,
  allArticles,
  updateArticleVerification,
  updateArticleStatus,
  inviteReporter,
  acceptInviteForReporter,
} from "../controllers/admin.controller.js";

adminRoutes.get("/all-users", getAllUsers);
adminRoutes.get("/all-reporters", getAllReporters);
adminRoutes.put("/update-status/:userId", updateStatusOfUser);
adminRoutes.get("/all-articles", allArticles);
adminRoutes.put("/verify-article/:articleId", updateArticleVerification);
adminRoutes.put("/update-article-status/:articleId", updateArticleStatus);
adminRoutes.post("/invite-reporter", inviteReporter);
adminRoutes.post("/accept-invite-reporter/:token", acceptInviteForReporter);

export default adminRoutes;
//hello
