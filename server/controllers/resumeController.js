import imageKit from "../config/imagekit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

//create resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    //create new resume
    const newResume = await Resume.create({ userId, title });

    return res
      .status(201)
      .json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//delete resume
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const isDeleted = await Resume.findOneAndDelete({ userId, _id: resumeId });
    if (!isDeleted) {
      return res.status(400).json({ message: "unable to delete" });
    }

    return res.status(201).json({ message: "Resume deletes successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get userResume by id
// GET: /api/resumes/get

export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    //create new resume
    const resume = await Resume.findOne({ userId, _id: resumeId });

    if (!resume) {
      return res.status(400).json({ message: "resume not found" });
    }

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(201).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get public userResume by id
// GET: /api/resumes/public

export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    //create new resume
    const resume = await Resume.findOne({ public: true, _id: resumeId });

    if (!resume) {
      return res.status(400).json({ message: "resume not found" });
    }

    return res.status(201).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//updating resume
//PUT: /api/resumes/update

export const updateResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBg } = req.body;

    const image = req.file;

    let resumeDataCopy;

    if (typeof resumeData === "string") {
      resumeDataCopy = await JSON.parse(resumeData);
    } else {
      resumeDataCopy = await JSON.parse(JSON.stringify(resumeData));
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

      resumeDataCopy.personal_info.image = response.url;
    }

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "resume updated successfully", resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
