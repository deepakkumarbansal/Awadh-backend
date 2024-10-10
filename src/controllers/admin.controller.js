import User from "../models/user.model.js";
import Article from "../models/article.model.js";
import { isValidEmail, checkPassStrength } from "../config/utility/validate.js";
import { signJwt, jwtVerify } from "../config/libraries/jwt.js";
import { sendEmail } from "../config/libraries/nodemailer.js";
import environmentConfig from "../config/env/environmentConfig.js";
import { generatePassword } from "../config/utility/createPassword.js";
import {
  encryptPassword,
  comparePassword,
} from "../config/libraries/bcrypt.js";

// Get all users with pagination
const getAllUsers = async (req, res) => {
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

    // Fetch users
    const users = await User.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Fetch total count for pagination info
    const totalCount = await User.countDocuments();

    return res.status(200).json({
      totalCount,
      page: pageNumber,
      limit: limitNumber,
      users,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

// Get all reporters with pagination
const getAllReporters = async (req, res) => {
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

    // Fetch reporters (assuming reporters have a specific role or attribute)
    const reporters = await User.find({ role: "reporter" }) // Adjust the query based on how reporters are identified
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Fetch total count for pagination info
    const totalCount = await User.countDocuments({ role: "reporter" });

    return res.status(200).json({
      totalCount,
      page: pageNumber,
      limit: limitNumber,
      reporters,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch reporters", error: error.message });
  }
};

// Update status of a user
const updateStatusOfUser = async (req, res) => {
  try {
    const { userId: id } = req.params;
    const { status } = req.body;

    // Validate that status is provided
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Update user status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User status updated successfully", updatedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update user status", error: error.message });
  }
};

// Get all articles with pagination in descending order
const allArticles = async (req, res) => {
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

    // Fetch articles in descending order
    const articles = await Article.find()
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Fetch total count for pagination info
    const totalCount = await Article.countDocuments();

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

const updateArticleVerification = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { verified } = req.body;

    // Validate that 'verified' is provided and is a boolean
    if (typeof verified !== "boolean") {
      return res
        .status(400)
        .json({ message: "The 'verified' field must be a boolean value" });
    }

    // Find and update the article's verification status
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      { verified },
      { new: true } // Return the updated document
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({
      message: "Article verification status updated successfully",
      updatedArticle,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update article verification status",
      error: error.message,
    });
  }
};

//Update article status
const updateArticleStatus = async (req, res) => {
  try {
    const { articleId: id } = req.params;
    const { status } = req.body;
    console.log(id, status, "idStatus");

    // Validate that status is provided
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Update article status
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { status }, //accepted, rejected, draft
      { new: true } // Return the updated document
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    return res.status(200).json({
      message: "Article status updated successfully",
      updatedArticle,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update article status",
      error: error.message,
    });
  }
};

const inviteReporter = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check if the email is already registered
    const isUserExist = await User.findOne({ email }).lean();
    if (isUserExist) {
      return res.status(400).json({
        message:
          "Email is already registered. Please try logging in or use a different email.",
      });
    }

    // Generate a JWT token for the invite (expires in 20 minutes)
    const token = signJwt({ email }, "20m", "access");
console.log("check",environmentConfig.FRONTEND_URL)
    // Construct the invite link
    const link = `${environmentConfig.FRONTEND_URL}/accept-invite-reporter?token=${token}`;

    // Set email subject and content
    const subject = "Invitation for Reporter Account on AWADH KESARI";
    const html = `<div>You have been invited to become a reporter. Click <a href="${link}">here</a> to accept the invitation.</div>`;

    // Send the invite email
    await sendEmail(email, subject, html);

    // Respond to the client indicating success
    return res.status(200).json({
      message: `An invitation has been sent to ${email}.`,
    });
  } catch (error) {
    console.error("Error sending reporter invitation:", error);
    return res.status(500).json({
      message:
        "An error occurred while sending the invitation. Please try again later.",
    });
  }
};

const acceptInviteForReporter = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token and extract email
    const { email } = jwtVerify(token, "access");

    // Generate random password
    const randomPassword = generatePassword(8);

    // Encrypt the password in parallel with saving user
    const encryptedPassword = await encryptPassword(randomPassword);

    // Create new user object
    const user = new User({
      name: email.split("@")[0], // Set name to the part of the email before '@'
      email: email.toLowerCase(), // Ensure the email is lowercase
      password: encryptedPassword, // Save the encrypted password
      role: "reporter",
    });

    // Save user and prepare the email sending in parallel to optimize performance
    await Promise.all([
      user.save(),
      sendEmail(
        email,
        "Thank you for confirming your reporter account",
        `<div>Your temporary password: <strong>${randomPassword}</strong></div><div>Please log in using <a href="${environmentConfig.FRONTEND_URL}/login">this link</a>.</div>`
      ),
    ]);

    // Respond with success message
    return res.status(200).json({
      message:
        "Account created successfully. Please check your email for login details.",
    });
  } catch (error) {
    console.error("Error accepting reporter invite:", error);

    // Respond with a generic error message
    return res.status(500).json({
      message:
        "An error occurred while accepting the invite. Please try again later.",
    });
  }
};

export {
  getAllUsers,
  getAllReporters,
  updateStatusOfUser,
  allArticles,
  updateArticleVerification,
  updateArticleStatus,
  inviteReporter,
  acceptInviteForReporter,
};
