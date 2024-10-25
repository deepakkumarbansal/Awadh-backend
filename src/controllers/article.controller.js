import { ApiError } from "../config/utility/ApiError.js";
import { ApiResponse } from "../config/utility/ApiResponse.js";
import { asyncHandler } from "../config/utility/asyncHandler.js";
import Article from "../models/article.model.js";
import User from "../models/user.model.js";

const createArticle = async (req, res) => {
  try {
    const {
      reporterId,
      title,
      subheading,
      content,
      category,
      images,
      videoLink,
      status,
    } = req.body;

    // Check for required fields
    if (!reporterId || !title || !content || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const user = await User.findById(reporterId);
    if (user.role == "user") {
      return res.status(401).json({
        message:
          "Unauthorized access, User is not allowed to post the news article",
      });
    }

    console.log("reporterId", reporterId);
    const postStatus = status ? status : "draft";
    const article = await Article.create({
      reporterId,
      title,
      subheading,
      content,
      category,
      images,
      videoLink,
      status: postStatus,
    });

    return res
      .status(201)
      .json({ message: "Article created successfully", article });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Article creation failed", error: error.message });
  }
};

// Get All Articles with Pagination
// will be showed on home page
const getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate page and limit
    if (pageNumber < 1 || limitNumber < 1) {
      return res
        .status(400)
        .json({ message: "Page and limit must be positive integers" });
    }

    // Fetch articles that are verified
    const articles = await Article.find({ status: "accepted" })
      .sort({ createdAt: -1 }) // Optional: Sort by creation date in descending order
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Fetch total count of verified articles for pagination info
    const totalCount = await Article.countDocuments({ verified: true });

    return res.status(200).json({
      totalCount,
      page: pageNumber,
      limit: limitNumber,
      articles,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch articles", error: error.message });
  }
};

// Get Single Article by ID
const getArticleById = async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await Article.findById(articleId).populate(
      "reporterId",
      "name"
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({ article });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch article", error: error.message });
  }
};

// Delete Article by ID
const deleteArticleById = async (req, res) => {
  try {
    const { articleId } = req.params;

    const deletedArticle = await Article.findByIdAndDelete(articleId);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete article", error: error.message });
  }
};

// Get Articles by Reporter ID with Pagination
const getArticlesByReporterId = async (req, res) => {
  try {
    const { reporterId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate page and limit
    if (pageNumber < 1 || limitNumber < 1) {
      return res
        .status(400)
        .json({ message: "Page and limit must be positive integers" });
    }

    // Fetch articles
    const articles = await Article.find({ reporterId })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Fetch total count for pagination info
    const totalCount = await Article.countDocuments({ reporterId });

    return res.status(200).json({
      totalCount,
      page: pageNumber,
      limit: limitNumber,
      articles,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch articles", error: error.message });
  }
};

// Update Article by ID (Only provided fields)
const updateArticleById = async (req, res) => {
  try {
    const { articleId } = req.params;
    const updateData = req.body;

    // Validate that at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    // Perform the update
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res
      .status(200)
      .json({ message: "Article updated successfully", updatedArticle });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update article", error: error.message });
  }
};

const getArticleByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { category } = req.query;

    if (!category) {
      return res.status(404).json({ message: "Category Required!" });
    }

    // Fetch articles that are verified
    const articles = await Article.find({ status: "accepted", category })
      .sort({ createdAt: -1 }) // Optional: Sort by creation date in descending order
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("reporterId", "name")
      .exec();

    const totalCount = await Article.countDocuments({
      status: "accepted",
      category,
    });

    return res.status(200).json({
      totalCount,
      page: pageNumber,
      limit: limitNumber,
      articles,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch articles", error: error.message });
  }
};

const searchArticles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { role, path, reporterId, query } = req.body; // role can be user, "", admin, reporter

  if (!query) {
    throw new ApiError(404, "Search query cannot be empty");
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (pageNumber < 1 || limitNumber < 1) {
    return res
      .status(400)
      .json({ message: "Page and limit must be positive integers" });
  }

  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: "i" } }, // case-insensitive regex search
      { subheading: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
      {status: {$regex: query, $options: "i"}}
    ],
  };

  if (
    role?.trim() === "" ||
    role?.trim() === "user" ||
    path?.trim() === "/" ||
    path?.trim() === ""
  ) {
    searchQuery.status = "accepted";
  } else if (role?.trim() === "repoter" && path?.trim() === "/reporter") {
    searchQuery.status = { $in: ["accepted", "rejected", "draft"] };
    searchQuery.reporterId = reporterId;
  } else if (role?.trim() === "admin" && path?.trim() === "/admin") {
    searchQuery.status = { $in: ["accepted", "rejected", "draft"] };
  }

  const articles = await Article.find(searchQuery)
    .sort({ createdAt: -1 }) // Optional: Sort by creation date in descending order
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .exec();

  const totalCount = await Article.countDocuments(searchQuery);

  if (!articles?.length > 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          articles,
          totalCount,
          limitNumber,
          pageNumber,
        },
        "Articles Searched Successfully"
      )
    );
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles,
        totalCount,
        limitNumber,
        pageNumber,
      },
      "Articles Searched Successfully"
    )
  );
});

const getUniqueCategoryNews = async (req, res) => {
  try {
    const categoryNews = await Article.aggregate([
      {$match: {status: "accepted"}},
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$category",
          latestNews: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestNews" } },
    ]).limit(4);

    return res.status(200).json({
      success: true,
      message: "Unique category news fetched successfully",
      data: categoryNews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unique category news",
      error: error.message,
    });
  }
};

export {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticleById,
  deleteArticleById,
  getArticlesByReporterId,
  getArticleByCategory,
  searchArticles,
  getUniqueCategoryNews
};
