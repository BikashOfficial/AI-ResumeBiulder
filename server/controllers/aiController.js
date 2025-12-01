import ai from "../config/ai.js";
import Resume from "../models/Resume.js";

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
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
export const enhanceJobDescription = async (req, res) => {
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
export const enhanceProjectDescription = async (req, res) => {
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
          content: `You are an expert resume writer whose job is to enhance the user’s job or project description into a polished, ATS-friendly version. Rewrite the input into a concise 1–2 sentence paragraph using strong action verbs, measurable results, and relevant keywords while highlighting responsibilities and achievements. Return only the improved paragraph with no headings, bullets, examples, or extra explanation; if the input is unrelated to resume or project descriptions, return an empty string.`,
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
export const uploadResume = async (req, res) => {
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

export const uploadResumeForAts = async (req, res) => {
  try {
    // 1. Destructure required data from the request body
    const { resumeText, jobDesc } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res
        .status(400)
        .json({ message: "Missing required field: resumeText." });
    }

    // 2. Define the desired JSON structure for the AI's response (as a simple template for the prompt)
    const jsonTemplate = `{
      "atsScore": 0,
      "summary": "string",
      "improvements": ["string"],
      "keywordsFound": ["string"],
      "missingKeywords": ["string"]
    }`;

    // 3. Create the detailed prompt for the AI
    // const userPrompt = `
    //   You are an expert ATS (Applicant Tracking System) Analyzer.
    //   Your task is to compare the RESUME TEXT against the JOB DESCRIPTION to calculate an ATS compatibility score (0-100) and identify key matching and missing keywords.

    //   --- RESUME TEXT ---
    //   ${resumeText}

    //   --- JOB DESCRIPTION ---
    //   ${jobDesc}

    //   Provide the full analysis in a single JSON object that matches the following template. **DO NOT INCLUDE ANY TEXT BEFORE OR AFTER THE JSON OBJECT.**

    //   --- JSON OUTPUT TEMPLATE ---
    //   ${jsonTemplate}
    // `;

    // const userPrompt = `
    //     You are an ATS (Applicant Tracking System) Analyzer.
    //     Your role is strictly to evaluate the RESUME TEXT against the JOB DESCRIPTION using keyword matching, role        relevance, skill alignment, and content similarity.

    //     Follow these rules STRICTLY:
    //     1. Output must be ONLY a JSON object. No explanations. No additional text.
    //     2. Score must be realistic for ATS systems (0–100).
    //     3. Focus on: skills match, job title relevance, experience similarity, missing skills, strength of keywords,        measurable achievements.
    //     4. Be objective. Do NOT inflate the score.
    //     5. If resume lacks clear data, lower the score.

    //     --- RESUME TEXT ---
    //     ${resumeText}

    //     --- JOB DESCRIPTION ---
    //     ${jobDesc}

    //     Now generate a JSON response EXACTLY in this structure:

    //     ${jsonTemplate}

    //     Do not include anything outside the JSON. No markdown, no descriptions, no comments.
    //     `;

//     const userPrompt = `
// You are an ATS (Applicant Tracking System) Analyzer and an expert hiring manager.
// Your task is to:
// 1. Evaluate the RESUME TEXT against the JOB DESCRIPTION for ATS scoring.
// 2. Provide a fully honest, critical, and unbiased review of the resume (inside the JSON fields only).

// Follow these rules STRICTLY:
// 1. Output must be ONLY a JSON object. No explanations. No additional text.
// 2. Score must be realistic for ATS systems (0–100).
// 3. Focus on: skills match, job title relevance, experience similarity, missing skills, keyword strength, measurable achievements.
// 4. Be objective. Do NOT inflate the score.
// 5. Missing keywords MUST come from the JD.
// 6. "summary" must include an honest critique of resume strengths + weaknesses.
// 7. "improvements" must contain brutally honest improvement points.
// 8. If resume lacks clear data, lower the score.
// 9. Do not add any content outside the JSON.

// --- RESUME TEXT ---
// ${resumeText}

// --- JOB DESCRIPTION ---
// ${jobDesc}

// Now generate a JSON response EXACTLY in this structure:

// ${jsonTemplate}

// Do not include anything outside the JSON. No markdown, no descriptions, no comments.
// `;

const userPrompt = jobDesc ? `
You are an ATS (Applicant Tracking System) Analyzer and an expert hiring manager.

Your job:
Provide a brutally honest, critical, unbiased evaluation of the RESUME compared to the JOB DESCRIPTION — but keep the content short, concise, and focused only on the most important points.

STRICT RULES:
1. Output ONLY a JSON object. No extra text.
2. ATS score must be realistic (0–100).
3. "summary" must be brutally honest but MAX 3 sentences. Include strengths + weaknesses without unnecessary details.
4. "improvements" must be MAX 5 points, each 1 short sentence, directly actionable, and no long explanations.
5. "keywordsFound" and "missingKeywords" must be short lists (only important keywords).
6. Missing keywords MUST come from the JD.
7. Be objective — do NOT sugarcoat or inflate the score.
8. If resume lacks clarity or relevance, reduce the score.

--- RESUME TEXT ---
${resumeText}

--- JOB DESCRIPTION ---
${jobDesc}

Return ONLY the JSON in this structure:

${jsonTemplate}
` : `
You are an ATS (Applicant Tracking System) Analyzer and an expert resume evaluator.

Your job:
Provide a brutally honest, critical, unbiased evaluation of the RESUME's general quality, strengths, and areas for improvement — keep the content short, concise, and focused only on the most important points.

STRICT RULES:
1. Output ONLY a JSON object. No extra text.
2. ATS score must be realistic (0–100) based on overall resume quality, formatting, clarity, and content strength.
3. "summary" must be brutally honest but MAX 3 sentences. Include strengths + weaknesses without unnecessary details.
4. "improvements" must be MAX 5 points, each 1 short sentence, directly actionable, and no long explanations.
5. "keywordsFound" should list important skills and keywords found in the resume.
6. "missingKeywords" should suggest critical keywords and skills that would strengthen the resume.
7. Be objective — do NOT sugarcoat or inflate the score.
8. If resume lacks clarity or relevance, reduce the score.

--- RESUME TEXT ---
${resumeText}

Return ONLY the JSON in this structure:

${jsonTemplate}
`;


    // 4. Call the API using the method that WORKS in your environment
    const response = await ai.chat.completions.create({
      model: process.env.GEMINI_AI_MODEL,
      messages: [
        {
          role: "system",
          // Instruct the AI to be an expert and STRICTLY return JSON
          content:
            "You are an expert ATS (Applicant Tracking System) Analyzer. Your response MUST be a single JSON object. Do not include any conversational text.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      // Use the simple JSON object type which is widely supported
      response_format: { type: "json_object" },
      // NOTE: We are removing the 'schema' property here, as it may be causing the 400 error in your specific SDK implementation.
    });

    // 5. Parse and return the JSON response
    const extractedData = response.choices[0].message.content;
    const atsResult = JSON.parse(extractedData);

    return res.status(200).json(atsResult);
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    // Return a 500 status for server-side errors
    return res.status(500).json({
      message: "Failed to perform ATS analysis",
      error: error.message,
    });
  }
};
