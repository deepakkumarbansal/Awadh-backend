import express from "express";
const articleRoutes = express.Router();
import {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticleById,
  deleteArticleById,
  getArticlesByReporterId,getArticleByCategory
} from "../controllers/article.controller.js";

articleRoutes.post("/create", createArticle);
articleRoutes.get("/all-articles", getAllArticles); // Paginated
articleRoutes.get("/whole-article/:articleId", getArticleById);
articleRoutes.patch("/update-article/:articleId", updateArticleById);
articleRoutes.delete("/delete-article/:articleId", deleteArticleById);
articleRoutes.get("/reporter-articels/:reporterId", getArticlesByReporterId); // Paginated
articleRoutes.get("/article-category",getArticleByCategory) //paginated

export default articleRoutes;
