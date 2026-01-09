
# AI Resume Builder - Create Professional Resumes with AI

This is a web application that helps users build beautiful resumes with the help of AI. It also provides an ATS score checker to help users optimize their resumes for Applicant Tracking Systems. This project is built with the MERN stack.

## Live Demo

[https://ai-resume-builder.vercel.app/](https://ai-resume-builder.vercel.app/)

## Getting Started

To get started with the AI Resume Builder, you'll need to have Node.js and npm installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ai-resume-builder.git
   ```

2. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the `server` directory and add the following variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the application:**
   ```bash
   # Run the server
   cd server
   npm start

   # Run the client
   cd ../client
   npm run dev
   ```

## Features

- **User Authentication:** Users can register and log in to the application.
- **Dashboard:** Users can view and manage their resumes on the dashboard.
- **Resume Builder:** Users can create and edit their resumes using a form-based editor.
- **AI-Powered Resume Enhancement:**
  - Enhance job descriptions
  - Enhance professional summaries
  - Enhance project descriptions
- **Multiple Resume Templates:** Users can choose from a variety of resume templates.
- **Resume Preview:** Users can preview their resumes in real-time.
- **ATS Score Checker:** Users can upload their resumes and a job description to get an ATS score and suggestions for improvement.
- **Public Resume URL:** Users can share a public URL of their resume.
- **Image Upload:** Users can upload their profile picture.

## Technologies Used

- **Frontend:**
  - React
  - Redux
  - Vite
  - Tailwind CSS

- **Backend:**
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT

## API Endpoints

### User Endpoints

- `POST /api/user/register`: Register a new user.
- `POST /api/user/login`: Log in a user.
- `GET /api/user/data`: Get the logged-in user's data.
- `GET /api/user/resumes`: Get all the resumes of the logged-in user.

### Resume Endpoints

- `POST /api/resume/create`: Create a new resume.
- `PUT /api/resume/update`: Update an existing resume.
- `DELETE /api/resume/delete/:resumeId`: Delete a resume.
- `GET /api/resume/get/:resumeId`: Get a resume by its ID.
- `GET /api/resume/public/:resumeId`: Get a public resume by its ID.

### AI Endpoints

- `POST /api/ai/enhance-job-desc`: Enhance a job description using AI.
- `POST /api/ai/enhance-pro-sum`: Enhance a professional summary using AI.
- `POST /api/ai/enhance-project-desc`: Enhance a project description using AI.
- `POST /api/ai/upload-resume`: Upload a resume for analysis.
- `POST /api/ai/ats`: Upload a resume for ATS score checking.

## Data Structures

### User

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

### Resume

```json
{
  "user": "ObjectId",
  "template": "string",
  "personal": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "website": "string",
    "linkedin": "string",
    "github": "string",
    "image": "string"
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "link": "string"
    }
  ],
  "skills": ["string"]
}
```
