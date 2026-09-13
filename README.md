# 🚀 AI Resume Builder — Distributed Microservices Platform
## Live Demo
## 📑 Table of Contents
[https://ai-resume-biulder.vercel.app/](https://ai-resume-biulder.vercel.app/)


> **Build, Enhance, and Score Resumes with Gemini 3.5 Flash and a High-Performance Microservices Architecture**  
> An intelligent resume platform powered by React 19, Tailwind CSS, API Gateway Layer-7 routing, Redis session cache (zero-DB auth), and decoupled Node.js microservices.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Directory Layout](#-project-directory-layout)
- [Microservices & Port Inventory](#-microservices--port-inventory)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Environment Variables Guide](#-environment-variables-guide)

---

## 🏛 Overview & Architecture

AI Resume Builder is engineered as a **Distributed Microservices Architecture** designed for high throughput, sub-millisecond edge authentication, and compute-isolated AI processing.

```
                         Client (React / Vite @ :5173)
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │            API GATEWAY (Port: 8000)             │
             │   • Centralized CORS      • Morgan Logging      │
             │   • Redis Edge Auth       • Header Enrichment   │
             └────────┬───────────────┬───────────────┬────────┘
                      │               │               │
            Proxy     │     Proxy     │     Proxy     │
            /api/auth │     /api/resumes      /api/ai │
                      ▼               ▼               ▼
             ┌────────────────┐┌─────────────┐┌────────────────┐
             │  AUTH SERVICE  ││RESUME SERVIC││   AI SERVICE   │
             │   Port: 8001   ││ Port: 8002  ││   Port: 8003   │
             ├────────────────┤├─────────────┤├────────────────┤
             │• Bcrypt Auth   ││• Resumes CRUD││• Gemini 3.5    │
             │• Redis Session ││• ImageKit CDN││• ATS Analyzer │
             │• HttpOnly Cook.││• Public Link││• Resume Parser │
             └───────┬────────┘└──────┬──────┘└───────┬────────┘
                     │                │               │
                     └────────────────┴───────────────┴────────┐
                                      SHARED REDIS (Port 6379) │
                                      • session-${sessionId}   │
                                      • user-session-${userId} │
```

### Architectural Highlights:
1. **Perimeter Redis Authentication**: The Gateway intercepts incoming requests, validates session UUIDs against Redis in `< 0.5ms`, and injects verified user identity (`x-user-id`) to downstream microservices.
2. **Compute-Asymmetric AI Isolation**: Text enhancement, schema extraction, and ATS parsing run isolated on the AI Microservice (`:8003`) powered by `@google/generative-ai` (`gemini-3.5-flash`).
3. **Database-Per-Service**: Auth, Resume, and AI services maintain isolated database connections, preventing schema collisions and data leakage.

---

## ✨ Key Features

- **⚡ Zero-DB Profile Resolution**: User profiles (`/api/users/data` and `/api/me`) are served straight from the Redis cache in microseconds without touching MongoDB.
- **🤖 AI-Powered Resume Builder**:
  - Auto-generate ATS-friendly **Job Descriptions**.
  - Polish **Professional Summaries**.
  - Enhance **Project Descriptions** using strong action verbs and metrics.
- **📄 AI Resume Text Parser**: Upload an existing resume to automatically parse and populate personal info, work experience, projects, and education into structured JSON.
- **🎯 Real-Time ATS Score Checker**: Evaluate resume keyword alignment against a target job description and receive a compatibility score (0–100) with missing keyword gap analysis.
- **🖼️ Automated Photo Processing**: Profile photo uploads with ImageKit face detection cropping (`fo-face`) and AI background removal.
- **🔗 Shareable Public URL**: Instant public web links (`/view/:resumeId`) for portfolios and recruiters without authentication barriers.

---

## 🛠 Tech Stack

### Frontend Client
- **Framework**: React 19 + Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS + Lucide Icons
- **HTTP Client**: Axios with `withCredentials: true`
- **Notifications**: React Hot Toast

### Backend Microservices
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Reverse Proxy**: `express-http-proxy`
- **In-Memory Cache**: Redis / Upstash (`ioredis`)
- **Primary Database**: MongoDB Atlas + Mongoose
- **Generative AI**: Google Generative AI SDK (`gemini-3.5-flash`)
- **Media CDN**: ImageKit SDK
- **Security**: Bcrypt password hashing + `HttpOnly` SameSite session cookies

---

## 📂 Project Directory Layout

```text
ai-resume-builder/
├── client/                     # Frontend React SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components & forms
│   │   ├── pages/              # Dashboard, Builder, ATS, Preview, Login
│   │   ├── config/api.js       # Configured Axios instance
│   │   └── app/features/       # Redux slices
│   └── .env                    # VITE_BASE_URL=http://localhost:8000
│
└── server/                     # Microservices Root
    ├── gateway/                # Port 8000: API Gateway & Perimeter Auth
    │   ├── middleware/         # Redis-backed protect middleware
    │   ├── utils/              # proxyWithHeader header injector
    │   └── controllers/        # Zero-DB profile controller
    │
    ├── services/
    │   ├── auth/               # Port 8001: User auth & Redis session inception
    │   ├── resume/             # Port 8002: Resume CRUD & ImageKit integration
    │   └── ai/                 # Port 8003: Gemini 3.5 Flash & ATS evaluation
    │
    └── shared/                 # Centralized Redis Singleton Client
```

---

## 🌐 Microservices & Port Inventory

| Service | Port | Working Directory | Primary Role |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | `5173` | `client/` | React 19 Single Page Application |
| **API Gateway** | `8000` | `server/gateway/` | Central Ingress, Redis perimeter authentication, header enrichment |
| **Auth Service** | `8001` | `server/services/auth/` | Registration, login, logout, Redis session writes |
| **Resume Service** | `8002` | `server/services/resume/` | Resume CRUD, public sharing, photo uploading |
| **AI Service** | `8003` | `server/services/ai/` | Google Gemini 3.5 Flash, ATS analysis, schema parsing |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js `>= 20.x`
- Redis server running locally on `localhost:6379` OR an Upstash Redis URL
- MongoDB Atlas Cluster
- Google Gemini API Key

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/ai-resume-builder.git
cd ai-resume-builder

# 2. Install Client Dependencies
cd client
npm install

# 3. Install Gateway Dependencies
cd ../server/gateway
npm install

# 4. Install Services Dependencies
cd ../services/auth && npm install
cd ../resume && npm install
cd ../ai && npm install
```

### Running the Full Platform Locally

Open separate terminal tabs for each service:

```bash
# Tab 1: Auth Service (Port 8001)
cd server/services/auth
npm run dev

# Tab 2: Resume Service (Port 8002)
cd server/services/resume
npm run dev

# Tab 3: AI Service (Port 8003)
cd server/services/ai
npm run dev

# Tab 4: API Gateway (Port 8000)
cd server/gateway
npm run dev

# Tab 5: Client Application (Port 5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 📡 API Endpoints Overview

All requests from the client target the **API Gateway** at `http://localhost:8000`:

### Authentication & Users
- `POST /api/users/register` — Register a new account.
- `POST /api/users/login` — Log in and start a 14-day Redis session.
- `POST /api/users/logout` — Destroy Redis session and clear cookie.
- `GET /api/users/data` or `GET /api/me` — Sub-millisecond zero-DB user profile.

### Resumes
- `GET /api/users/resumes` — Get all resumes for the authenticated user.
- `POST /api/resumes/create` — Create a new resume.
- `PUT /api/resumes/update` — Update resume content and/or upload avatar.
- `DELETE /api/resumes/delete/:resumeId` — Delete a resume.
- `GET /api/resumes/get/:resumeId` — Fetch a single resume.
- `GET /api/resumes/public/:resumeId` — Public preview (No auth required).

### Artificial Intelligence (Gemini 3.5 Flash)
- `POST /api/ai/upload-resume` — Parse raw resume text into structured JSON.
- `POST /api/ai/ats` — Compare resume against job description for ATS score.
- `POST /api/ai/enhance-job-desc` — Rewrite job descriptions with action verbs.
- `POST /api/ai/enhance-pro-sum` — Craft professional summaries.
- `POST /api/ai/enhance-project-desc` — Enhance project details.

---

## ⚙️ Environment Variables Guide

### Client (`client/.env`)
```ini
VITE_BASE_URL="http://localhost:8000"
```

### Gateway (`server/gateway/.env`)
```ini
PORT=8000
AUTH_SERVICE=http://localhost:8001
RESUME_SERVICE=http://localhost:8002
AI_SERVICE=http://localhost:8003
FRONTEND_URL="http://localhost:5173"
REDIS_URL="rediss://default:...@master-ocelot-150014.upstash.io:6379"
```

### Auth Service (`server/services/auth/.env`)
```ini
PORT=8001
MONGO_URI="mongodb+srv://.../auth"
REDIS_URL="rediss://default:...@master-ocelot-150014.upstash.io:6379"
```

### Resume Service (`server/services/resume/.env`)
```ini
PORT=8002
MONGO_URI="mongodb+srv://.../resume"
IMAGEKIT_PRIVATE_KEY="private_..."
```

### AI Service (`server/services/ai/.env`)
```ini
PORT=8003
MONGO_URI="mongodb+srv://.../ai"
GEMINI_API_KEY="AIzaSy..."
GEMINI_AI_MODEL="gemini-3.5-flash"
```

---

## 📄 License
This project is licensed under the ISC License.
