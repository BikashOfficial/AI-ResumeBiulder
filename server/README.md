# 🌐 AI Resume Builder Server — Microservices Architecture, API Gateway & Distributed System Design

> **Production Distributed Core of AI Resume Builder**  
> An enterprise-grade, distributed microservices platform powered by Node.js (Express 5), Redis in-memory session cache, Google Generative AI (`gemini-3.5-flash`), ImageKit CDN, and isolated database-per-service MongoDB clusters.

---

## 📑 Table of Contents

1. [Architectural Overview & System Topology](#1-architectural-overview--system-topology)
   - [System Design Philosophy](#system-design-philosophy)
   - [Unified Port & Service Mapping](#unified-port--service-mapping)
   - [High-Level Architecture Diagram](#high-level-architecture-diagram)
2. [Subsystem Navigation & Services Portfolio](#2-subsystem-navigation--services-portfolio)
   - [API Gateway (`:8000`)](#api-gateway-port-8000)
   - [Auth Microservice (`:8001`)](#auth-microservice-port-8001)
   - [Resume Microservice (`:8002`)](#resume-microservice-port-8002)
   - [AI Microservice (`:8003`)](#ai-microservice-port-8003)
   - [Shared Infrastructure & Redis Cache](#shared-infrastructure--redis-cache)
3. [Global End-to-End System Workflows](#3-global-end-to-end-system-workflows)
   - [Workflow 1: Registration, Login & Redis Session Inception](#workflow-1-registration-login--redis-session-inception)
   - [Workflow 2: Zero-DB Profile Resolution via API Gateway](#workflow-2-zero-db-profile-resolution-via-api-gateway)
   - [Workflow 3: Resume Management & ImageKit Processing](#workflow-3-resume-management--imagekit-processing)
   - [Workflow 4: AI Resume Parsing & ATS Score Analysis (Gemini 3.5 Flash)](#workflow-4-ai-resume-parsing--ats-score-analysis-gemini-35-flash)
4. [Cross-Cutting Architectural Mechanisms](#4-cross-cutting-architectural-mechanisms)
   - [Perimeter Session Authentication & Header Enrichment (`x-user-id`)](#perimeter-session-authentication--header-enrichment-x-user-id)
   - [Dual Authentication Support (Cookies & Bearer Tokens)](#dual-authentication-support-cookies--bearer-tokens)
   - [Streaming Proxy Pipeline (No express.json at Gateway)](#streaming-proxy-pipeline-no-expressjson-at-gateway)
5. [Complete Master API Endpoints Reference](#5-complete-master-api-endpoints-reference)
   - [Gateway Ingress Routes (`:8000`)](#gateway-ingress-routes-8000)
   - [Auth Endpoints (`:8001`)](#auth-endpoints-8001)
   - [Resume Endpoints (`:8002`)](#resume-endpoints-8002)
   - [AI Endpoints (`:8003`)](#ai-endpoints-8003)
6. [Data Storage Topology & Schemas](#6-data-storage-topology--schemas)
   - [MongoDB Database-Per-Service Layout](#mongodb-database-per-service-layout)
   - [Centralized Redis Key-Space Registry](#centralized-redis-key-space-registry)
7. [Environment Configuration Reference](#7-environment-configuration-reference)
8. [Local Development & Operations Runbook](#8-local-development--operations-runbook)

---

## 1. Architectural Overview & System Topology

### System Design Philosophy
The AI Resume Builder server implements a **decoupled Layer-7 API Gateway and Microservices Architecture**. Monolithic dependencies have been eliminated in favor of isolated microservices:

1. **Edge Reverse Proxy & Centralized CORS**: Client web applications communicate exclusively with the API Gateway (`:8000`). Internal microservices execute on an isolated loopback/internal network.
2. **Perimeter Session Authentication (Zero DB Hits)**: Inbound authentication tokens/cookies are evaluated at the Gateway directly against Redis . Downstream microservices receive pre-authenticated identities via the trusted `x-user-id` header.
3. **Database-Per-Service Pattern**: Services maintain independent MongoDB database connections, guaranteeing modularity and preventing schema coupling.
4. **Compute Asymmetry & AI Isolation**: Generative AI operations (Google Gemini 3.5 Flash) and document text parsing run on dedicated processes (`:8003`), preventing event-loop starvation on CRUD endpoints.

---

### Unified Port & Service Mapping

```
                                  Client Application (React / Vite)
                                       http://localhost:5173
                                                 │
                                                 │ HTTP Requests / Cookies (session=<UUID>)
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Port: 8000) [server/gateway]                         │
│  • Central CORS Engine                • Morgan Logger             • No express.json()       │
│  • Edge Session Auth via Redis        • Injects x-user-id Header  • express-http-proxy Pipe │
└───────┬──────────────────────────┬────────────────────────────┬─────────────────────────────┘
        │                          │                            │                             
        │ Ingress:                 │ Ingress:                   │ Ingress:                    
        │ /api/auth/* & /api/users │ /api/resume/* & /resumes   │ /api/ai/*                   
        │ (Public Proxy)           │ (protect + x-user-id)      │ (protect + x-user-id)       
        ▼                          ▼                            ▼                             
┌───────────────┐          ┌───────────────┐            ┌───────────────┐             
│ AUTH SERVICE  │          │RESUME SERVICE │            │  AI SERVICE   │             
│  Port: 8001   │          │  Port: 8002   │            │  Port: 8003   │             
├───────────────┤          ├───────────────┤            ├───────────────┤             
│• Register/Log │          │• protect mw   │            │• protect mw   │             
│• Redis Session│          │• Resumes CRUD │            │• Resume Parser│             
│• Set-Cookie   │          │• ImageKit CDN │            │• Gemini 3.5   │             
└───────┬───────┘          └───────┬───────┘            └───────┬───────┘             
        │                          │                            │                     
        └──────────────────────────┴────────────────────────────┴───────────────────────┐
                                   SHARED REDIS (Port 6379 / Upstash)                   │
                                   • session-${sessionId} (JSON: { userId, name, email })
                                   • user-session-${userId} (${sessionId})
```

| Service | Port | Root Directory | Primary Responsibility | Primary Storage |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | `8000` | `server/gateway` | Ingress routing, reverse proxy, perimeter auth, header enrichment | Redis (Read-only cache) |
| **Auth Service** | `8001` | `server/services/auth` | User identity, bcrypt hashing, Redis session creation & eviction | MongoDB (`auth`) & Redis |
| **Resume Service** | `8002` | `server/services/resume` | Resume CRUD, public preview sharing, ImageKit photo uploads | MongoDB (`resume`) & ImageKit |
| **AI Service** | `8003` | `server/services/ai` | Gemini 3.5 Flash integration, ATS analysis, schema parsing | MongoDB (`ai`) & Google GenAI |
| **Shared Redis** | `6379` | `server/shared/redis` | Distributed session storage & reverse user index | Redis (In-Memory) |

---

## 2. Subsystem Navigation & Services Portfolio

### API Gateway (Port `8000`)
- **Directory**: `server/gateway`
- **Responsibilities**:
  - Centralized CORS for `http://localhost:5173` with credentials enabled.
  - Edge validation of session UUID against Redis `session-${sessionId}`.
  - Injects `x-user-id` header into outbound requests to downstream microservices.
  - Streams raw multipart/form-data and JSON bodies without buffering via `express-http-proxy`.
  - Serves `GET /api/me` and `GET /api/users/data` directly from Redis in `< 0.5ms`.

### Auth Microservice (Port `8001`)
- **Directory**: `server/services/auth`
- **Responsibilities**:
  - Secure password hashing with `bcrypt` (10 rounds).
  - Session creation in Redis (`session-${sessionId}` and `user-session-${userId}`).
  - Sets `HttpOnly`, `SameSite` session cookies.
  - Logout key deletion and cookie clearing.

### Resume Microservice (Port `8002`)
- **Directory**: `server/services/resume`
- **Responsibilities**:
  - Complete resume document management (Create, Read, Update, Delete).
  - Downstream `protect` middleware verifying `x-user-id`.
  - Profile picture processing and AI face cropping with ImageKit CDN.
  - Public unauthenticated preview route: `GET /public/:resumeId`.

### AI Microservice (Port `8003`)
- **Directory**: `server/services/ai`
- **Responsibilities**:
  - Powered by `@google/generative-ai` (`gemini-3.5-flash`).
  - ATS compatibility scoring (0–100) with keyword gap analysis.
  - Schema-guided resume text extraction (`uploadResume`) into structured JSON documents.
  - Single-shot prompt engineering for job descriptions, summaries, and projects.

---

## 3. Global End-to-End System Workflows

### Workflow 1: Registration, Login & Redis Session Inception

```mermaid
sequenceDiagram
    autonumber
    actor User as Frontend Client
    participant GW as API Gateway (:8000)
    participant Auth as Auth Service (:8001)
    participant DB as MongoDB (User)
    participant Redis as Shared Redis

    User->>GW: POST /api/users/login { email, password }
    GW->>Auth: Forward to http://localhost:8001/login
    Auth->>DB: User.findOne({ email })
    Auth->>Auth: bcrypt.compare(password, user.password)
    Auth->>Auth: Generate UUID sessionId
    Auth->>Redis: SET session-${sessionId} "{ userId, name, email }" (EX: 14d)
    Auth->>Redis: SET user-session-${userId} "${sessionId}" (EX: 14d)
    Auth-->>GW: 200 OK + Set-Cookie: session=UUID + JSON { message, token, user }
    GW-->>User: 200 OK + Set-Cookie
```

---

### Workflow 2: Zero-DB Profile Resolution via API Gateway

```mermaid
sequenceDiagram
    autonumber
    actor User as Frontend Client
    participant GW as API Gateway (:8000)
    participant Redis as Shared Redis

    User->>GW: GET /api/users/data (Cookie or Authorization: Bearer <sessionId>)
    GW->>GW: Extract sessionId from Cookie or Header
    GW->>Redis: GET session-${sessionId}
    Redis-->>GW: "{ userId: '...', name: '...', email: '...' }"
    GW-->>User: 200 OK { user: { userId, name, email } }
```

---

### Workflow 3: Resume Management & ImageKit Processing

```mermaid
sequenceDiagram
    autonumber
    actor User as Frontend Client
    participant GW as API Gateway (:8000)
    participant Redis as Shared Redis
    participant Resume as Resume Service (:8002)
    participant IK as ImageKit CDN
    participant DB as MongoDB (Resume)

    User->>GW: PUT /api/resumes/update (Multipart FormData + Cookie)
    GW->>Redis: Validate session-${sessionId}
    Redis-->>GW: Valid session ({ userId: "usr_101" })
    GW->>Resume: Stream payload + Header: x-user-id: usr_101
    Resume->>Resume: Multer processes image file
    opt Image Included
        Resume->>IK: Upload file stream with fo-face cropping
        IK-->>Resume: CDN URL
    end
    Resume->>DB: Resume.findOneAndUpdate({ _id, userId: "usr_101" }, update)
    Resume-->>GW: 200 OK { message, resume }
    GW-->>User: 200 OK
```

---

### Workflow 4: AI Resume Parsing & ATS Score Analysis (Gemini 3.5 Flash)

```mermaid
sequenceDiagram
    autonumber
    actor User as Frontend Client
    participant GW as API Gateway (:8000)
    participant AI as AI Service (:8003)
    participant Gemini as Google GenAI (gemini-3.5-flash)
    participant DB as MongoDB (Resume)

    User->>GW: POST /api/ai/upload-resume { resumeText, title }
    GW->>GW: protect middleware verifies session
    GW->>AI: Forward with Header x-user-id: usr_101
    AI->>Gemini: model.generateContent(prompt) [responseMimeType: "application/json"]
    Gemini-->>AI: Structured JSON (skills, experience, education, personal_info)
    AI->>DB: Resume.create({ userId: usr_101, ...parseData })
    AI-->>GW: 200 OK { resumeId: "res_abc" }
    GW-->>User: 200 OK
```

---

## 4. Cross-Cutting Architectural Mechanisms

### Perimeter Session Authentication & Header Enrichment (`x-user-id`)
1. Client sends session ID via `HttpOnly` cookie or `Authorization: Bearer <sessionId>`.
2. Gateway `protect` middleware resolves `session-${sessionId}` from Redis.
3. `proxyWithHeader` forcefully assigns `proxyReqOpts.headers["x-user-id"] = req.user.userId`.
4. Downstream services read `req.userId = req.headers["x-user-id"]`. Client-supplied headers cannot bypass edge sanitization.

### Dual Authentication Support (Cookies & Bearer Tokens)
The Gateway gracefully extracts credentials from:
- `req.cookies?.session`
- Raw `Cookie: session=...` header regex
- `req.headers.authorization` (`Bearer <sessionId>` or raw `<sessionId>`)

### Streaming Proxy Pipeline (No express.json at Gateway)
Body parsers like `express.json()` consume incoming HTTP streams. By omitting body parsers at the Gateway level, multipart uploads and JSON streams flow uninterrupted directly into downstream microservices.

---

## 5. Complete Master API Endpoints Reference

### Gateway Ingress Routes (`:8000`)
| Endpoint | Method | Access | Ingress Target | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/users/login` | `POST` | Public | Auth Service (`:8001`) | Authenticates user credentials and starts Redis session. |
| `/api/users/register`| `POST` | Public | Auth Service (`:8001`) | Registers user and creates session. |
| `/api/users/logout` | `POST` | Public | Auth Service (`:8001`) | Invalidates session in Redis and clears cookie. |
| `/api/users/data` | `GET` | Protected | Gateway Local Handler | Instant zero-DB user profile lookup from Redis. |
| `/api/me` | `GET` | Protected | Gateway Local Handler | Alternate profile endpoint returning `req.user`. |
| `/api/users/resumes`| `GET` | Protected | Resume Service (`:8002`) | Retrieves user's resumes. |
| `/api/resumes/create`| `POST`| Protected | Resume Service (`:8002`) | Creates a new resume document. |
| `/api/resumes/update`| `PUT` | Protected | Resume Service (`:8002`) | Updates resume data and uploads profile image. |
| `/api/resumes/delete/:id`| `DELETE`| Protected | Resume Service (`:8002`)| Deletes a resume owned by user. |
| `/api/resumes/get/:id` | `GET` | Protected | Resume Service (`:8002`) | Retrieves a single resume document. |
| `/api/resumes/public/:id`| `GET` | **Public** | Resume Service (`:8002`) | Public preview viewable without authentication. |
| `/api/ai/upload-resume`| `POST` | Protected | AI Service (`:8003`) | Extracts text into a structured resume document. |
| `/api/ai/ats` | `POST` | Protected | AI Service (`:8003`) | Evaluates resume ATS score and suggests improvements. |
| `/api/ai/enhance-job-desc`| `POST` | Protected | AI Service (`:8003`) | AI enhancement for job descriptions. |
| `/api/ai/enhance-pro-sum` | `POST` | Protected | AI Service (`:8003`) | AI enhancement for professional summary. |
| `/api/ai/enhance-project-desc`| `POST` | Protected | AI Service (`:8003`) | AI enhancement for project descriptions. |

---

## 6. Data Storage Topology & Schemas

### MongoDB Database-Per-Service Layout

```
MongoDB Cluster (mongodb+srv://...)
├── Database: auth
│   └── Collection: users
│       └── Fields: name, email (unique), password (bcrypt), timestamps
│
├── Database: resume
│   └── Collection: resumes
│       └── Fields: userId (indexed), title, public, template, accent_color,
│                   personal_info, experience, project, education, skills
│
└── Database: ai
    └── Collection: resumes (Mirrored schema for AI extraction)
```

### Centralized Redis Key-Space Registry

| Key Pattern | Type | TTL | Set By | Read By | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `session-${sessionId}` | String (JSON) | 14 Days | Auth Service | Gateway (`protect` & `/api/me`) | Edge session profile resolution |
| `user-session-${userId}` | String | 14 Days | Auth Service | Auth Service | Secondary reverse lookup index |

---

## 7. Environment Configuration Reference

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

## 8. Local Development & Operations Runbook

### Service Boot Order

```bash
# Terminal 1: Auth Service (Port 8001)
cd server/services/auth
npm run dev

# Terminal 2: Resume Service (Port 8002)
cd server/services/resume
npm run dev

# Terminal 3: AI Service (Port 8003)
cd server/services/ai
npm run dev

# Terminal 4: API Gateway (Port 8000)
cd server/gateway
npm run dev

# Terminal 5: Client Application (Port 5173)
cd client
npm run dev
```


