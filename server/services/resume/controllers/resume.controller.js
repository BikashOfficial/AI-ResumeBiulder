import imageKit from "../config/imagekit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// Create resume
// POST: /create
export const createResume = async (req, res) => {
  try {
    const userId = req.userId || req.headers["x-user-id"];
    const { title } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - missing user ID" });
    }

    const newResume = await Resume.create({ userId, title });

    return res
      .status(201)
      .json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Delete resume
// DELETE: /delete/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId || req.headers["x-user-id"];
    const { resumeId } = req.params;

    const isDeleted = await Resume.findOneAndDelete({ userId, _id: resumeId });
    if (!isDeleted) {
      return res.status(400).json({ message: "Unable to delete resume" });
    }

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get user resume by id
// GET: /get/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId || req.headers["x-user-id"];
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ userId, _id: resumeId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get public resume by id
// GET: /public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ public: true, _id: resumeId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Update resume
// PUT: /update
export const updateResumeById = async (req, res) => {
  try {
    const userId = req.userId || req.headers["x-user-id"];
    const { resumeId, resumeData, removeBg } = req.body;

    const image = req.file;

    let resumeDataCopy;

    if (typeof resumeData === "string") {
      resumeDataCopy = JSON.parse(resumeData);
    } else {
      resumeDataCopy = JSON.parse(JSON.stringify(resumeData || {}));
    }

    if (image) {
      const imageBufferData = fs.createReadStream(image.path);

      const response = await imageKit.files.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
        transformation: {
          pre: "w-300,h-300,fo-face,z-0.75" + (removeBg ? ",e-bgremove" : ""),
        },
      });

      if (!resumeDataCopy.personal_info) {
        resumeDataCopy.personal_info = {};
      }
      resumeDataCopy.personal_info.image = response.url;
    }

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { new: true },
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res
      .status(200)
      .json({ message: "Resume updated successfully", resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get user resumes
// GET: /resumes
export const getUserResumes = async (req, res) => {
  try {
    const userId = req.userId || req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - missing user ID" });
    }

    const resume = await Resume.find({ userId });

    return res.status(200).json({ resume: resume || [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};