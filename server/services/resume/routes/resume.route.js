import express from "express";
import {
  createResume,
  deleteResume,
  getPublicResumeById,
  getResumeById,
  getUserResumes,
  updateResumeById,
} from "../controllers/resume.controller.js";
import upload from "../config/multer.js";
import protect from "../middleware/auth.middleware.js";

const resumeRouter = express.Router();

// User resumes list
resumeRouter.get("/", protect, getUserResumes);
resumeRouter.get("/resumes", protect, getUserResumes);
resumeRouter.get("/get-resumes", protect, getUserResumes);

// Resume CRUD
resumeRouter.post("/create", protect, createResume);
resumeRouter.put("/update", upload.single("image"), protect, updateResumeById);
resumeRouter.delete("/delete/:resumeId", protect, deleteResume);
resumeRouter.get("/get/:resumeId", protect, getResumeById);

// Public access (no protect needed)
resumeRouter.get("/public/:resumeId", getPublicResumeById);

export default resumeRouter;
