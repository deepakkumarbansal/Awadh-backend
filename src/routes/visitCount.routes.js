import express from "express";
import {
  getVisitCount,
  updateVisitCount,
} from "../controllers/visitCount.controller.js";

const visitCountRoutes = express.Router();

// Route to get the visit count
visitCountRoutes.get("/visit-count", getVisitCount);
// Route to update the visit count
visitCountRoutes.post("/update-visit-count", updateVisitCount);

export default visitCountRoutes;
