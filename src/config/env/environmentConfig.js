import dotenv from "dotenv";
dotenv.config();

const environmentConfig = {
  PORT: process.env.PORT || 8400,
  MONGO_URI: process.env.MONGO_URI,
  JWT_ACCESS_KEY: process.env.JWT_ACCESS_KEY,
  JWT_ACCESS_EXPIRY: "15d",
  JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY,
  JWT_REFRESH_EXPIRY: "30d",
  FRONTEND_URL: process.env.FRONTEND_URL,
};

export default environmentConfig;
