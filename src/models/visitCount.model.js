import mongoose from "mongoose";

const countSchema = new mongoose.Schema(
  {
    count: {
      type: Number,
      default: 1, // Initialize with 1 for the first visit
    },
  },
  {
    timestamps: false, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Disables the __v field
  }
);

const visitorCount = new mongoose.model("VisitCount", countSchema);

export default visitorCount;
