import ai from "../config/ai.js";
import Resume from "../models/Resume.js";


// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req,res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.GEMINI_AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "you are an expert in resume writing.Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience,and career objectives. Make it compelling and ATS-friendly. and only retun text no options or anything else. if input is something else that not related to ur given work then just ignore it",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req,res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.GEMINI_AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "you are an expert in resume writing.Your task is to enhance the job description of a resume. The job description should be 1-2 sentences also highlighting key responsibilities and achivements. Use action verbs and quantifiable results where possible .Make it ATS-friendly. and only retun text no options or anything else.if input is something else that not related to ur given work then just ignore it",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST: /api/ai/enhance-project-desc
export const enhanceProjectDescription = async (req,res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.GEMINI_AI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert resume writer whose job is to enhance the user’s job or project description into a polished, ATS-friendly version. Rewrite the input into a concise 1–2 sentence paragraph using strong action verbs, measurable results, and relevant keywords while highlighting responsibilities and achievements. Return only the improved paragraph with no headings, bullets, examples, or extra explanation; if the input is unrelated to resume or project descriptions, return an empty string.`

        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;

    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST: /api/ai/upload-resume
export const uploadResume = async (req,res) => {
  try {
    const { resumeText, title } = req.body;

    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({ message: "Missing resume text fields" });
    }

    const userPrompt = `extract data from this resume: ${resumeText}
    
    Provide data in the following JSON formate with no additional text before or after:

      professional_summary: {
      type: String,
      default: "",
    },
    skills: [{ type: String }],
    personal_info: {
      image: { type: String, default: "" },
      full_name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
      profession: { type: String, default: "" },
    },

    experience: [
      {
        company: { type: String },
        position: { type: String },
        start_date: { type: String },
        end_date: { type: String },
        description: { type: String },
        is_current: { type: Boolean },
      },
    ],
    project: [
      {
        name: { type: String },
        type: { type: String },
        description: { type: String },
      },
    ],
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        graduation_date: { type: String },
        gpa: { type: String },
      },
    ],
  },

    `;

    const response = await ai.chat.completions.create({
      model: process.env.GEMINI_AI_MODEL,
      messages: [
        {
          role: "system",
          content: "you are an expert AI Agent to extract data from resume.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const extractedData = response.choices[0].message.content;
    const parseData = JSON.parse(extractedData);

    const newResume = await Resume.create({
      userId,
      title,
      ...parseData,
    });

    return res.status(200).json({ resumeId: newResume._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
