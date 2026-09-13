import express from "express";
import {
  enhanceJobDescription,
  enhanceProfessionalSummary,
  enhanceProjectDescription,
  uploadResume,
  uploadResumeForAts,
} from "../controllers/ai.controller.js";
import protect from "../middleware/auth.middleware.js";

const aiRouter = express.Router();

aiRouter.post("/enhance-job-desc", protect, enhanceJobDescription);
aiRouter.post("/enhance-pro-sum", protect, enhanceProfessionalSummary);
aiRouter.post("/enhance-project-desc", protect, enhanceProjectDescription);
aiRouter.post("/upload-resume", protect, uploadResume);
aiRouter.post("/ats", protect, uploadResumeForAts);

export default aiRouter;
