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
import { asyncHandler } from "../config/utility/asyncHandler.js";
import { ApiError } from "../config/utility/ApiError.js";
import { ApiResponse } from "../config/utility/ApiResponse.js";

// Get all users with pagination
const getAllUsers = async (req, res) => {
  console.log("came");
  
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
    const users = await User.find({role: "user"})
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Fetch total count for pagination info
    const totalCount = await User.countDocuments({role: "user"});
    console.log("came", pageNumber);
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
    console.log("page", pageNumber, totalCount, limitNumber);
    
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


const totalUsersPerMonth = asyncHandler(async(req, res)=>{
  const user = req.user;
  if(user?.role != "admin"){
    throw new ApiError(401, "You are not authorized to access users per month details")
  }
  const output = await User.aggregate([
    {
      $match: {
        role : "user"
      }
    },
    {
      $group: {
        _id: {
          year: {$year: "$createdAt"},
          month: {$month: "$createdAt"},
        },
        registrationsInCurrentMonth: {
          $sum: 1,
        }
      }
    },
    {
      $group: {
        _id: "$_id.year",
        userRegistrationsPerMonth: {
          $push:  {
            month: "$_id.month",
            registrations: "$registrationsInCurrentMonth",
          }
        },
        totalRegistrationsInYear: {
          $sum : "$registrationsInCurrentMonth"
        }
      }
    },
    {
      $project: {
        _id: 0,
        year : "$_id",
        userRegistrationsPerMonth : 1,
        totalRegistrationsInYear : 1
      }
    }
  ])
  
  return res.status(200).json(new ApiResponse(200, output, "Fetched users per month successfully"))

})

const totalArticlesPerMonth = asyncHandler(async(req, res)=> {
  const user = req.user;
  const role = user?.role;
  if(!role || role == "user"){
    console.log("role", role);
    
    throw new ApiError(401, "You are not authorized to access users per month details")
  }
  const output = await Article.aggregate([
    {
      $match: (role === "reporter") ? {reporterId : user?._id} : {},
    },
    {
      $group: {
        _id: {
          year: {$year: "$createdAt"},
          month: {$month: "$createdAt"},
        },
        totalAriclesInAMonth: {
          $sum: 1,
        },
        acceptedArticlesInAMonth: {
            $sum: {
              $cond: [{$eq : ["$status", "accepted"]}, 1, 0]
          }
        },
        rejectedArticlesInAMonth: {
          $sum: {
            $cond: [{$eq: ["$status", "rejected"]}, 1, 0]
          }
        },
        draftArticlesInAMonth: {
          $sum: {
            $cond: [{$eq: ["$status", "draft"]}, 1, 0]
          }
        }
      }
    },
    {
      $group: {
        _id: "$_id.year",
        months: {
          $push: {
            month: "$_id.month",
            totalAriticlesInAMonth: "$totalAriclesInAMonth",
            acceptedArticles: "$acceptedArticlesInAMonth",
            rejectedArticles: "$rejectedArticlesInAMonth",
            draftArticles: "$draftArticlesInAMonth",
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        year: "$_id",
        months: 1
      }
    }
  ]);
  
  return res.status(200).json(new ApiResponse(200, output, "Articles per month of all years fetched successfully"))
})

const searchUsers = asyncHandler(async (req, res)=>{
  const {page=1, limit=10, query, userType} = req.query;
  const user = req.user;

  if(user.role !== "admin"){
    throw new ApiError(404, "You are not allowed to access this information");
  }

  if(!query || query?.trim() === ""){
    throw new ApiError(401, "Searched query for user is empty");
  }

  const pageNo = parseInt(page, 10);
  const limitNo = parseInt(limit, 10);

  if(limitNo < 1 || pageNo < 1){
    throw new ApiError(402, `Page and limit should be greater than one`)
  }

  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: "i" } }, // case-insensitive regex search
      { email: { $regex: query, $options: "i" } },
      { mobile: { $regex: query, $options: "i" } },
      { status: { $regex: query, $options: "i" } },
      { role: { $regex: query, $options: "i" } },
    ],
  };

  if(userType?.trim()?.toLowerCase() === "user"){
    searchQuery.role = "user";
  } else if (userType?.trim()?.toLowerCase() === "reporter"){
    searchQuery.role = "reporter"
  } else {
    throw new ApiError(404, "Please enter valid user type i.e user or reporter")
  }

  const result = await 
  User
  .find(searchQuery)
  .select("-password -role")
  .skip((pageNo - 1)*limitNo)
  .limit(limitNo)
  .sort({createdAt: -1});
  ;

  const totalCount = await User.countDocuments(searchQuery);

  return res.status(200).json(
  new ApiResponse(200, {
    [`${userType}s`]: result, page:pageNo, limit: limitNo, totalCount
  }, "Users Fetched successfully"))
  
})

export {
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
};
