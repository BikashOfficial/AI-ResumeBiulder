# 📦 OrimaAI Shared Infrastructure Layer

Welcome to the `server/shared` directory of OrimaAI. This directory houses shared singleton clients, cross-cutting concerns, and utilities used across all microservices (`gateway`, `auth`, `agent`, `billing`, and `chat`).

---

## 📂 Modules & Documentation

- [**Redis Shared Layer (`shared/redis`)**](./redis/README.md)
  - **Connection Client**: [`redis.js`](./redis/redis.js)
  - **Comprehensive Guide & Interview Questions**: [**Full Architecture, Workflows & Interview Guide (`redis/README.md`)**](./redis/README.md)

---

## 🌐 How Shared Infrastructure Powers OrimaAI

```
┌──────────────────────────────────────────────────────────┐
│                      server/shared                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │             redis/redis.js (Singleton)             │  │
│  └─────────────────────────┬──────────────────────────┘  │
└────────────────────────────┼─────────────────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Gateway    │      │ Auth Service │      │Agent Service │
│  (Sessions)  │      │(User Sync &  │      │(Rate Limits  │
│              │      │ Credits)     │      │ & Memory)    │
└──────────────┘      └──────────────┘      └──────────────┘
```

For the complete in-depth breakdown of endpoints, session persistence, rate limiting algorithms, sequence diagrams, and top interview questions, see:
👉 [**Redis Architecture & Endpoints Documentation**](./redis/README.md)
