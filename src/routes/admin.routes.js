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
  totalUsersPerMonth,
  totalArticlesPerMonth,
  searchUsers
} from "../controllers/admin.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

adminRoutes.use(isAuthenticated);

adminRoutes.get("/all-users", getAllUsers);
adminRoutes.get("/all-reporters", getAllReporters);
adminRoutes.put("/update-status/:userId", updateStatusOfUser);
adminRoutes.get("/all-articles", allArticles);
adminRoutes.put("/verify-article/:articleId", updateArticleVerification);
adminRoutes.put("/update-article-status/:articleId", updateArticleStatus);
adminRoutes.post("/invite-reporter", inviteReporter);
adminRoutes.get('/total-users-per-month', totalUsersPerMonth);
adminRoutes.get('/total-articles-per-month', totalArticlesPerMonth);
adminRoutes.get('/search-users', searchUsers);


export default adminRoutes;
//hello
