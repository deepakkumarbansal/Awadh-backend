import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Article from "../models/article.model.js";

const createComment = async (req, res) => {
  try {
    const { articleId, userId, comment } = req.body;

    // Check if article and user exist in parallel
    const [article, user] = await Promise.all([
      Article.findById(articleId),
      User.findById(userId),
    ]);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the article is verified
    if (!article.status === "accepted") {
      return res
        .status(403)
        .json({ message: "Cannot comment on unverified articles" });
    }

    // Create the comment and update the article's comments array
    const newComment = await Comment.create({
      articleId,
      userId,
      comment,
    })
    await newComment.save();

    const populatedComment = await newComment
      .populate({
        path: "userId",
        select: "name avatarUrl",
        model: "User",
      });

    // Construct the response with user details
    const responseComment = {
      _id: populatedComment._id,
      comment: populatedComment.comment,
      commentedDate: populatedComment.createdAt.toLocaleString(),
      userName: populatedComment.userId.name, // The user's name
      avatarUrl: populatedComment.userId.avatarUrl, // The user's avatar URL
    };
    
    return res.status(201).json({
      message: "Comment created successfully",
      comment: responseComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error); // Improved error logging
    return res.status(500).json({
      message: "Comment creation failed",
      error: error.message,
    });
  }
};

const getCommentsByArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
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

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Fetch comments related to the article with user details
    const comments = await Comment.find({ articleId })
      .sort({ createdAt: -1 }) // Sort by latest comment first
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate({
        path: "userId",
        select: "name avatarUrl", // Populate only the `name` field
        model: "User",
      })
      .exec();

    // Format comments with user's name and commented date
    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      comment: comment.comment,
      commentedDate: comment.createdAt.toLocaleString(), // Format the date to a readable format
      userName: comment.userId ? comment.userId.name : "Anonymous", // Handle missing userName
      avatarUrl: comment.userId ? comment.userId.avatarUrl : "",
    }));

    // Fetch total count for pagination info
    const totalCount = await Comment.countDocuments({ articleId });

    return res.status(200).json({
      totalCount,
      page: pageNumber,
      limit: limitNumber,
      comments: formattedComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error); // Improved error logging
    return res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

export { createComment, getCommentsByArticle };
