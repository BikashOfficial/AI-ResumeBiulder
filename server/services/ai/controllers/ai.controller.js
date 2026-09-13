import { getGenerativeModel } from "../config/ai.js";
import Resume from "../models/Resume.js";

// Controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const model = getGenerativeModel({
      systemInstruction:
        "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. Return only the enhanced text with no options, formatting, or conversational text. If the input is not related to a resume, return an empty string.",
    });

    const result = await model.generateContent(userContent);
    const enhancedContent = result.response.text().trim();

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller for enhancing job description
// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const model = getGenerativeModel({
      systemInstruction:
        "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be 1-2 sentences highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. Return only the enhanced text with no options, formatting, or conversational text. If the input is not related to job descriptions, return an empty string.",
    });

    const result = await model.generateContent(userContent);
    const enhancedContent = result.response.text().trim();

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller for enhancing project description
// POST: /api/ai/enhance-project-desc
export const enhanceProjectDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const model = getGenerativeModel({
      systemInstruction:
        "You are an expert resume writer whose job is to enhance the user’s job or project description into a polished, ATS-friendly version. Rewrite the input into a concise 1–2 sentence paragraph using strong action verbs, measurable results, and relevant keywords while highlighting responsibilities and achievements. Return only the improved paragraph with no headings, bullets, examples, or extra explanation; if the input is unrelated to resume or project descriptions, return an empty string.",
    });

    const result = await model.generateContent(userContent);
    const enhancedContent = result.response.text().trim();

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller for extracting resume text into structured Resume document
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId || req.headers["x-user-id"];

    if (!resumeText) {
      return res.status(400).json({ message: "Missing resume text fields" });
    }

    const userPrompt = `Extract data from this resume:
${resumeText}

Provide data strictly in the following JSON format:
{
  "professional_summary": "string",
  "skills": ["string"],
  "personal_info": {
    "image": "",
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "website": "string",
    "profession": "string"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "start_date": "string",
      "end_date": "string",
      "description": "string",
      "is_current": false
    }
  ],
  "project": [
    {
      "name": "string",
      "type": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduation_date": "string",
      "gpa": "string"
    }
  ]
}`;

    const model = getGenerativeModel({
      systemInstruction: "You are an expert AI Agent to extract data from resume. Return strictly valid JSON adhering to the specified schema.",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await model.generateContent(userPrompt);
    let extractedData = response.response.text();
    extractedData = extractedData.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parseData = JSON.parse(extractedData);

    const newResume = await Resume.create({
      userId,
      title: title || "Untitled Resume",
      ...parseData,
    });

    return res.status(200).json({ resumeId: newResume._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller for ATS score analysis
// POST: /api/ai/ats
export const uploadResumeForAts = async (req, res) => {
  try {
    const { resumeText, jobDesc } = req.body;
    const userId = req.userId || req.headers["x-user-id"];

    if (!resumeText) {
      return res
        .status(400)
        .json({ message: "Missing required field: resumeText." });
    }

    const userPrompt = jobDesc
      ? `You are an ATS (Applicant Tracking System) Analyzer and an expert hiring manager.
Compare the RESUME TEXT against the JOB DESCRIPTION:

--- RESUME TEXT ---
${resumeText}

--- JOB DESCRIPTION ---
${jobDesc}

Rules:
1. Output ONLY a valid JSON object matching this structure:
{
  "atsScore": 0,
  "summary": "max 3 sentences honest critique",
  "improvements": ["max 5 actionable points"],
  "keywordsFound": ["keywords found"],
  "missingKeywords": ["missing keywords from JD"]
}
2. ATS score must be realistic (0–100).
3. Be objective — do not inflate the score.`
      : `You are an ATS (Applicant Tracking System) Analyzer and an expert hiring manager.
Evaluate the RESUME TEXT:

--- RESUME TEXT ---
${resumeText}

Rules:
1. Output ONLY a valid JSON object matching this structure:
{
  "atsScore": 0,
  "summary": "max 3 sentences honest critique",
  "improvements": ["max 5 actionable points"],
  "keywordsFound": ["important skills and keywords found"],
  "missingKeywords": ["critical keywords and skills that would strengthen the resume"]
}
2. ATS score must be realistic (0–100).
3. Be objective — do not inflate the score.`;

    const model = getGenerativeModel({
      systemInstruction: "You are an expert ATS Analyzer. Return strictly valid JSON adhering to the specified schema.",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await model.generateContent(userPrompt);
    let extractedData = response.response.text();
    extractedData = extractedData.replace(/```json/gi, "").replace(/```/g, "").trim();
    const atsResult = JSON.parse(extractedData);

    return res.status(200).json(atsResult);
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    return res.status(500).json({
      message: "Failed to perform ATS analysis",
      error: error.message,
    });
  }
};
