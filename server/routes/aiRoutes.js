import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  enhanceJobDescription,
  enhanceProfessionalSummary,
  enhanceProjectDescription,
  uploadResume,
  uploadResumeForAts,
} from "../controllers/aiController.js";
const aiRouter = express.Router();

aiRouter.post("/enhance-job-desc", protect, enhanceJobDescription);
aiRouter.post("/enhance-pro-sum", protect, enhanceProfessionalSummary);
aiRouter.post("/enhance-project-desc", protect, enhanceProjectDescription);
aiRouter.post("/upload-resume", protect, uploadResume);
aiRouter.post("/ats",protect,uploadResumeForAts)

export default aiRouter
