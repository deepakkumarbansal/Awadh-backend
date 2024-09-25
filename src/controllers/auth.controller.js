import User from "../models/user.model.js";
import { isValidEmail, checkPassStrength } from "../config/utility/validate.js";
import {
  encryptPassword,
  comparePassword,
} from "../config/libraries/bcrypt.js";
import { signJwt, jwtVerify } from "../config/libraries/jwt.js";

const register = async (req, res) => {
  try {
    console.log(req.body);
    
    const { name, email, password, mobile, role, status } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email is invalid" });
    }

    if (!checkPassStrength(password)) {
      return res.status(400).json({
        message:
          "Password should have one uppercase letter, one number, and minimum 6 characters",
      });
    }

    // Check if user exists
    const isUserExist = await User.findOne({ email }).lean();
    console.log("isUserExist",isUserExist);
    
    if (isUserExist) {
      return res
        .status(400)
        .json({ message: "User already exists, please login" });
    }

    const hashedPassword = await encryptPassword(password);
    console.log("hasedPass", hashedPassword);
    
    // Create user document
    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      role,
      status,
    });
    console.log("newuser", user);
    
    await user.save();
    console.log("Last");
    
    return res
      .status(201)
      .json({ message: "User Registration Successful", user: { email } });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "User Registration Failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("details of login", email, password);
    
    const user = await User.findOne({ email });
    console.log("user", user);
    
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // console.log("user", user);
    const isPasswordCorrect = await comparePassword(password, user.password);
<<<<<<< HEAD

    console.log("token");

=======
    console.log("correct password", isPasswordCorrect);
    
>>>>>>> 3ae172a (work on client changes)
    if (isPasswordCorrect) {
      const token = signJwt(
        { userId: user._id, role: user.role },
        "7d",
        "access"
      );
<<<<<<< HEAD

      console.log("token", token);

=======
      console.log("token", token);
      
>>>>>>> 3ae172a (work on client changes)
      return res.status(200).json({
        message: "Login Successful",
        token,
        userId: user._id,
        role: user.role,
      });
    }
    return res.status(401).json({ message: "Email or password is incorrect" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login Failed", error: error.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const token = signJwt({ email: user.email, id: user._id }, "20m", "access");
    // Subject to change accoding to frontend route
    const link = `${config.domain.app}/create-new-password?user=${user._id}&token=${token}`;

    const html = `<div><a href='${link}'>Reset Link</a></div>`;
    await sendEmail(email, "Reset Password", html);

    return res.status(200).json({ message: "Reset link sent to your e-mail" });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to send reset password link.: ${error.message}`,
    });
  }
};

const verifyEmailLinkAndUpdate = async (req, res) => {
  try {
    const { userId, token } = req.query;
    const { password, confirmPassword } = req.body;

    const user = await User.findById(userId);

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password fields cannot be empty.",
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password should match." });
    }

    if (!checkPassStrength(password)) {
      return res.status(400).json({
        message:
          "Password should be have one uppercase letter, one number, and minimum 6 characters",
      });
    }

    const isVerified = jwtVerify(token, "access");

    if (!isVerified) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Encrypt the new password
    const newPassword = await encryptPassword(password);

    // Update the user's password
    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password updated successfully", ok: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to reset password: ${error.message}` });
  }
};

export { register, login, forgetPassword, verifyEmailLinkAndUpdate };
