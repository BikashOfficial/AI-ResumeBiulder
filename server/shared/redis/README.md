# ⚡ Redis Shared Layer — Complete Architecture, Workflows, Endpoints & System Design

> **A Definitive, Beginner-to-Advanced Technical Guide for OrimaAI**  
> This documentation explains how the centralized Redis singleton in `server/shared/redis/redis.js` powers OrimaAI's distributed microservices: session persistence, real-time credit tracking, rate-limiting algorithms, conversation memory caching, and cross-service synchronization.

---

## 📑 Table of Contents

1. [🎯 Top Interview Questions & Answers (Redis & Distributed Systems)](#1--top-interview-questions--answers-redis--distributed-systems)
   - [Category 1: Core Redis Architecture & Mechanics](#category-1-core-redis-architecture--mechanics)
   - [Category 2: Distributed Sessions & Security (Redis vs JWT)](#category-2-distributed-sessions--security-redis-vs-jwt)
   - [Category 3: Rate Limiting, Concurrency & Race Conditions](#category-3-rate-limiting-concurrency--race-conditions)
   - [Category 4: Caching Strategies, Invalidation & Memory Management](#category-4-caching-strategies-invalidation--memory-management)
   - [Category 5: Scaling, Persistence & Fault Tolerance](#category-5-scaling-persistence--fault-tolerance)
2. [Beginner's Glossary (Jargon Buster)](#2-beginners-glossary-jargon-buster)
3. [The Redis Singleton: What is `server/shared/redis`?](#3-the-redis-singleton-what-is-serversharedredis)
4. [High-Level System Architecture & Visual Diagrams](#4-high-level-system-architecture--visual-diagrams)
5. [Complete Redis Key-Space Schema in OrimaAI](#5-complete-redis-key-space-schema-in-orimaai)
6. [Every Endpoint & Codeflow Interacting with Redis](#6-every-endpoint--codeflow-interacting-with-redis)
   - [Workflow A: User Authentication & Session Creation (`POST /api/auth/login`)](#workflow-a-user-authentication--session-creation-post-apiauthlogin)
   - [Workflow B: API Gateway Request Interception (`protect` Middleware & `GET /api/me`)](#workflow-b-api-gateway-request-interception-protect-middleware--get-apime)
   - [Workflow C: Dynamic Agent Rate Limiting (`POST /api/agent/chat` & `Limits.js`)](#workflow-c-dynamic-agent-rate-limiting-post-apiagentchat--limitsjs)
   - [Workflow D: 20-Turn Conversation Memory Window (`getMemory.js`)](#workflow-d-20-turn-conversation-memory-window-getmemoryjs)
   - [Workflow E: Real-Time Credit Deduction (`POST /api/auth/deduct-credits`)](#workflow-e-real-time-credit-deduction-post-apiauthdeduct-credits)
   - [Workflow F: Razorpay Subscription & Plan Sync (`POST /api/billings/verify-payment`)](#workflow-f-razorpay-subscription--plan-sync-post-apibillingsverify-payment)
   - [Workflow G: User Logout & Session Revocation (`GET /api/auth/logout`)](#workflow-g-user-logout--session-revocation-get-apiauthlogout)
7. [Visual Step-by-Step Sequence Graphs](#7-visual-step-by-step-sequence-graphs)
8. [Advanced Redis Patterns: Code Improvements & Production Hardening](#8-advanced-redis-patterns-code-improvements--production-hardening)
9. [Redis CLI & `ioredis` Quick Reference](#9-redis-cli--ioredis-quick-reference)

---

## 1. 🎯 Top Interview Questions & Answers (Redis & Distributed Systems)

These questions represent the exact technical inquiries asked by Staff Engineers, Principal Architects, and System Design interviewers at companies like Google, Uber, Amazon, and Stripe when evaluating backend and distributed systems competencies.

---

### Category 1: Core Redis Architecture & Mechanics

#### Q1: Why is Redis so blisteringly fast (sub-millisecond latency) despite running on a single main thread?
> **Answer:**  
> Redis delivers 100,000+ operations per second on a single thread due to three fundamental architectural principles:
> 1. **In-Memory RAM Storage**: Traditional relational or document databases (PostgreSQL, MongoDB) persist data to Disk (SSD/HDD) through disk pages and write-ahead logs. Disk access involves bus latency and operating system page cache overhead (~5ms to 50ms). Redis stores all operational data structures purely in Random Access Memory (RAM), where access latency is ~50ns to 100ns (nanoseconds).
> 2. **Non-Blocking I/O Multiplexing (epoll/kqueue)**: Redis uses an event-driven loop backed by kernel notification mechanisms like Linux `epoll` or BSD `kqueue`. A single thread can monitor thousands of open client socket descriptors simultaneously without spending CPU cycles blocking or waiting for network packets.
> 3. **No Context Switching or Locking Overhead**: Multi-threaded databases incur heavy synchronization costs: mutex locks, read-write locks, condition variables, and CPU thread context switching. Because Redis executes all commands sequentially on one core, race conditions inside data structures are impossible, completely eliminating lock contention.

---

#### Q2: If Redis is single-threaded, how does it handle CPU-heavy operations without freezing all incoming requests?
> **Answer:**  
> 1. **Time Complexity Awareness**: All core Redis commands are designed to be $O(1)$ (like `GET`, `SET`, `INCR`, `LPUSH`, `SADD`) or $O(\log N)$ (like Sorted Set operations). Commands with $O(N)$ complexity (like `KEYS *`, `HGETALL` on massive hashes, or `FLUSHALL`) are dangerous anti-patterns in production.
> 2. **Background Helper Threads**: Since Redis 4.0+, background worker threads handle slow, non-blocking asynchronous jobs like unlinking deleted keys (`UNLINK`), freeing large memory blocks (`ASYNC`), and handling I/O socket reads/writes (introduced in Redis 6.0 Threaded I/O). The command execution itself remains strictly deterministic on the main thread.
> 3. **Forking for Snapshots**: When writing data to disk (RDB snapshots or AOF rewrites), Redis invokes the Linux `fork()` system call to create a background child process. Thanks to Operating System **Copy-On-Write (COW)**, the parent process continues serving client traffic with zero interruptions.

---

### Category 2: Distributed Sessions & Security (Redis vs JWT)

#### Q3: In OrimaAI, why did the team use Redis-backed server sessions (`session-${sessionId}`) with `httpOnly` cookies instead of pure stateless JWTs (JSON Web Tokens)?
> **Answer:**  
> While stateless JWTs are popular for simple microservices, they carry severe operational and security flaws in production AI platforms:
> 1. **Instant Revocation Capability (Kill Switch)**: A stateless JWT cannot be revoked before its expiration time unless an external blacklist is maintained (which requires a cache like Redis anyway!). If a user account is hacked or compromised, an attacker can use a leaked JWT until it expires. In OrimaAI, calling `GET /api/auth/logout` immediately deletes `session-${sessionId}` from Redis, terminating the session within 1 millisecond across all microservices.
> 2. **Live Synchronization of Fast-Changing State (Credits & Plan Upgrades)**: OrimaAI users spend credits per prompt (e.g., Coding agent costs 20 credits, Chat costs 1 credit). If credits were encoded inside a JWT payload, every single prompt would require issuing and transmitting a new JWT back to the client. With Redis-backed sessions, Auth or Agent services update `session-${sessionId}` directly in RAM. When the API Gateway routes a request, it always reads the exact, live credit balance without hitting MongoDB.
> 3. **XSS & Token Theft Mitigation**: JWTs stored in browser `localStorage` are completely vulnerable to cross-site scripting (XSS) attacks. OrimaAI sets an `httpOnly`, `sameSite: "strict"` cookie containing only an opaque `sessionId` (a random UUID). JavaScript running in the browser cannot read this cookie, making session hijacking dramatically harder.

---

#### Q4: What is the purpose of maintaining both `user-session-${userId}` and `session-${sessionId}` in Redis?
> **Answer:**  
> This represents a **Bidirectional Lookup Index Pattern**:
> - **Gateway Ingress (`Cookie` $\to$ `User Data`)**: When an HTTP request reaches the Gateway, it carries the `session` cookie (the `sessionId`). The Gateway executes `await redis.get(\`session-${sessionId}\`)` to instantly authenticate the user and parse their permissions ($O(1)$ direct lookup).
> - **Internal Service Updates (`userId` $\to$ `Session Key`)**: When the Billing Service verifies a Razorpay webhook or the Agent Service deducts credits, the microservice only knows the user's MongoDB `userId`. Without `user-session-${userId}`, the service would have no way to locate which active session key in Redis needs updating, forcing either a full key scan ($O(N)$, disastrous in production) or requiring the client to stay out-of-sync. By fetching `await redis.get(\`user-session-${userId}\`)`, the backend finds the active `sessionId` in 0.2ms and updates `session-${sessionId}` immediately.
> - **Single-Session Enforcement**: If OrimaAI decides to prevent multiple concurrent logins, setting `user-session-${userId}` allows the system to easily invalidate the previous `sessionId` before issuing a new one.

---

### Category 3: Rate Limiting, Concurrency & Race Conditions

#### Q5: Walk me through the rate limiting code in `Limits.js`. What subtle race condition exists in `redis.incr(key)` followed by `redis.expire(key, 60)`, and how do you solve it?
> **Answer:**  
> In [`server/services/agent/config/Limits.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/agent/config/Limits.js):
> ```javascript
> const count = await redis.incr(key);
> if (count === 1) {
>   await redis.expire(key, 60);
> }
> ```
> **The Race Condition:**  
> Between the execution of `redis.incr(key)` and `redis.expire(key, 60)`, the Node.js process could crash, run out of memory, experience a network partition, or reboot during a deployment. If the process dies right after `incr` creates the key, the `expire` command is **never executed**. The key now persists in Redis with an infinite TTL (`TTL = -1`). The user will accumulate requests until they exceed the threshold, at which point they will be **permanently locked out of the AI agent forever** until an engineer manually purges Redis!  
>
> **The Production Solution: Atomic Lua Script**  
> We execute both commands in a single atomic round-trip using Redis Lua scripting or the multi-argument `SET` command:
> ```javascript
> const count = await redis.eval(`
>   local current = redis.call('INCR', KEYS[1])
>   if current == 1 then
>     redis.call('EXPIRE', KEYS[1], ARGV[1])
>   end
>   return current
> `, 1, key, 60);
> ```
> Redis executes Lua scripts atomically—no other command runs concurrently, guaranteeing that an incremented key is 100% guaranteed to receive an expiration timestamp.

---

#### Q6: How does the Fixed Window Counter algorithm used in `Limits.js` compare to a Sliding Window Log or Token Bucket algorithm?
> **Answer:**  
> - **Fixed Window Counter (Used in OrimaAI)**:
>   - *Mechanism*: Increments a counter for a fixed duration (e.g., 60 seconds).
>   - *Pros*: Extremely fast ($O(1)$ memory, 1 integer per user-agent pair), minimal network bandwidth.
>   - *Cons*: Vulnerable to **traffic spikes at window boundaries**. If a user sends 20 requests at second 59 and 20 requests at second 61, they successfully executed 40 requests within a 2-second burst without exceeding the "20 requests per minute" limit.
> - **Sliding Window Log**:
>   - *Mechanism*: Uses a Redis Sorted Set (`ZSET`) where each request is added with `score = timestamp`. The system removes entries older than `now - 60s` (`ZREMRANGEBYSCORE`) and counts entries with `ZCARD`.
>   - *Pros*: Completely eliminates the boundary burst problem.
>   - *Cons*: Memory intensive ($O(N)$ where $N$ is the number of requests per window).
> - **Token Bucket / Leaky Bucket**:
>   - *Mechanism*: Tokens refill at a steady rate. Requests consume tokens. Allows controlled burstiness while smoothing traffic. Requires slightly more complex Redis Lua logic or a Redis module like `RedisCell`.

---

### Category 4: Caching Strategies, Invalidation & Memory Management

#### Q7: In `getMemory.js`, why does the code maintain a sliding window of 20 messages in Redis, and what happens when two concurrent messages are received for the same conversation?
> **Answer:**  
> In [`server/services/agent/config/getMemory.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/agent/config/getMemory.js):
> - When `messages.length > 20`, `messages.shift()` discards the oldest message turn before persisting the array back to Redis via `redis.set(key, JSON.stringify(messages), "EX", 172800)`.
> - **Why 20 messages?** Large Language Models charge input fees per token and experience "attention degradation" if prompts become too long. Retaining 20 messages (~10 full user-agent conversation turns) gives the LLM context of recent conversation history without exceeding token quotas or latency budgets.
> - **The Concurrency / Write-Loss Flaw**:  
>   If a user sends two messages simultaneously (or triggers two parallel agent queries):
>   1. Request A reads the 20 messages from Redis.
>   2. Request B reads the same 20 messages from Redis.
>   3. Request A appends its message and writes to Redis.
>   4. Request B appends its message and writes to Redis, overwriting and erasing Request A's message!  
>   **Production Fix**: Instead of serializing a raw JSON string via `GET` and `SET`, use the native Redis **List** data structure:
>   ```javascript
>   // Push new message atomically
>   await redis.rpush(`messages:${conversationId}`, JSON.stringify(newMsg));
>   // Trim to maintain only the last 20 elements atomically
>   await redis.ltrim(`messages:${conversationId}`, -20, -1);
>   await redis.expire(`messages:${conversationId}`, 172800);
>   ```
>   `RPUSH` and `LTRIM` are native atomic operations that eliminate read-modify-write race conditions without application-level locking.

---

#### Q8: What is Cache Stampede (Thundering Herd), and how could it affect OrimaAI if a conversation key expires?
> **Answer:**  
> - **The Scenario**: If a highly active conversation key `messages-${conversationId}` expires, or if multiple requests query the exact same conversation at the same microsecond:
> - **The Problem**: All concurrent requests experience a **Cache Miss** at the exact same time. Every worker process queries MongoDB simultaneously with `Message.find({ conversationId })`. This sudden avalanche of identical heavy queries overwhelms the MongoDB database pool, spiking CPU usage to 100% and stalling the application.
> - **The Solutions**:
>   1. **Distributed Mutex (Locking)**: Using Redis `SET key value NX PX 5000` to ensure only **one** Node.js worker queries MongoDB on a cache miss while other requests wait or retry.
>   2. **Probabilistic Early Expiration (XFetch Algorithm)**: Asynchronously refresh the cache in the background *before* the key actually expires based on query frequency and calculation time.

---

#### Q9: What happens when Redis runs out of physical RAM? Explain the `maxmemory` policies.
> **Answer:**  
> When the dataset reaches the configured `maxmemory` ceiling in `redis.conf`, Redis triggers its configured **eviction policy**:
> 1. `noeviction` (Default): Returns errors on write operations (`SET`, `HSET`, `LPUSH`) when memory is full, but continues serving read operations. Dangerous for systems that rely on caching for uptime.
> 2. `allkeys-lru`: Evicts the **Least Recently Used** keys first, regardless of whether they have a TTL set. Excellent for general caching layers.
> 3. `volatile-lru`: Evicts the Least Recently Used keys *only* among keys that have an explicit expiration (`EXPIRE`) set. In OrimaAI, this is the safest policy because long-term persisted keys are spared while expired chat buffers or old rate limit keys are recycled.
> 4. `volatile-ttl`: Evicts keys with the shortest remaining Time-To-Live first.
> 5. `allkeys-lfu` / `volatile-lfu`: Evicts the **Least Frequently Used** keys first.

---

### Category 5: Scaling, Persistence & Fault Tolerance

#### Q10: Does Redis save data to disk, and how should it be configured for a production deployment of OrimaAI?
> **Answer:**  
> Yes. Redis offers two distinct persistence mechanisms, which can be combined:
> 1. **RDB (Redis Database Backup - Point-in-Time Snapshots)**:
>    - Redis creates compact binary snapshots of the entire dataset at specified intervals (e.g., every 5 minutes if 100 keys changed).
>    - *Pros*: Ultra-fast server restarts, compact file size, minimal disk space.
>    - *Cons*: Potential data loss between snapshots (if Redis crashes at minute 4, the last 4 minutes of sessions and rate-limits are lost).
> 2. **AOF (Append Only File - Operation Logging)**:
>    - Redis logs every single write command (`SET`, `INCR`, `DEL`) sequentially to an append-only log file.
>    - Configured with `appendfsync everysec` (flushes OS buffer to disk every second).
>    - *Pros*: Maximum durability (maximum 1 second of data loss).
>    - *Cons*: Larger file size, slightly slower write performance than pure RDB.
> - **Production Recommendation for OrimaAI**: Run **RDB + AOF with `appendfsync everysec`**. Sessions and credit caches remain durable even across unexpected hardware reboots, and the snapshot allows rapid recovery.

---

#### Q11: How do you scale Redis when OrimaAI grows to millions of daily active AI queries?
> **Answer:**  
> 1. **Read Scaling (Master-Replica Architecture)**:
>    - 1 Primary Redis Master (handles writes like `redis.set` and `redis.incr`).
>    - Multiple Read Replicas across availability zones (handle reads like `redis.get` for session authentication at the Gateway).
>    - Redis Sentinel automates failover if the primary master crashes.
> 2. **Horizontal Partitioning (Redis Cluster)**:
>    - Distributes keys across 16,384 virtual **hash slots**.
>    - Redis Cluster uses `CRC16(key) mod 16384` to determine which node holds a given key.
>    - In OrimaAI, using Redis **Hash Tags** ensures that related keys map to the same node:
>      - `{user:123}:session` and `{user:123}:rate` both hash on `{user:123}`, allowing multi-key operations and Lua scripts to execute safely on the same cluster shard.

---

## 2. 📚 Beginner's Glossary (Jargon Buster)

If you are new to backend systems and caching, this glossary translates complex jargon into plain, intuitive English:

| Technical Term | What it Means in Plain English | Real-Life Analogy |
| :--- | :--- | :--- |
| **In-Memory (RAM)** | Storing data in your computer's high-speed working memory rather than on the hard drive/SSD. | Grabbing a sticky note off your desk (instant) vs driving to the city library to read an encyclopedia (slow). |
| **Disk I/O** | The process of reading or writing bytes to a mechanical hard drive or SSD. | Opening a physical filing cabinet in the basement. |
| **Latency** | The time it takes for a data packet to travel from the sender to the receiver and back. | The delay between dialing a phone number and hearing the first ring. |
| **TTL (Time To Live)** | An expiration countdown on a piece of data. When TTL reaches zero, Redis automatically deletes it. | A self-destructing message or a gallon of milk with an expiration date. |
| **Cache Hit** | The application looks for data in Redis and finds it immediately. No database query needed! | Reaching into your pocket and finding your car keys on the first try. |
| **Cache Miss** | The requested data is not in Redis. The app must fetch it from MongoDB and then store it in Redis for next time. | Searching your pocket, finding nothing, and having to walk back upstairs to search your bedroom. |
| **Cache Invalidation** | Deleting or updating stale data in the cache so users don't see outdated information. | Tearing down an old concert poster because the event has already passed. |
| **Atomicity** | An operation that happens completely or not at all, with zero possibility of another operation interfering halfway. | An elevator that travels directly from floor 1 to floor 10 without anyone else opening the doors mid-flight. |
| **Race Condition** | A software bug where two concurrent requests race to update the same data, leading to corrupt or missing state. | Two people sitting at different computers booking the very last concert ticket at the exact same millisecond. |
| **HTTP-Only Cookie** | A browser cookie marked with the `httpOnly` flag, making it completely invisible to JavaScript. Protects against hacker token theft. | A locked bank deposit box that only the mailman (browser network stack) can touch, not the homeowner (JavaScript). |
| **Session ID** | A long, unpredictable random string (UUID) that identifies a logged-in user without exposing their password or database ID. | A numbered wristband given to you at a water park entrance. |
| **Sliding Window** | A technique that maintains a moving time frame or count (e.g., keeping only the last 20 messages). | A train window that shows a rolling landscape; as new scenery enters the front, old scenery exits the back. |

---

## 3. 🔌 The Redis Singleton: What is `server/shared/redis`?

In `server/shared/redis/redis.js`, OrimaAI defines a **Centralized Redis Client Singleton**:

```javascript
// server/shared/redis/redis.js
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("redis connected");
});

export default redis;
```

### Why a Centralized Singleton?
1. **Connection Reuse (Pooling)**: Creating a new TCP socket connection to Redis on every HTTP request takes 2ms–5ms of network handshake overhead. By initializing `new Redis()` once and exporting the singleton instance, all services share the established, persistent TCP connection.
2. **Single Source of Truth**: All microservices (`gateway`, `auth`, `agent`, `billing`, `chat`) connect to the same centralized Redis instance, allowing instant cross-service state sharing.
3. **Automatic Reconnection & Resiliency**: The `ioredis` library automatically handles exponential backoff reconnection, offline command queueing, and cluster failover transparently.

---

## 4. 🌐 High-Level System Architecture & Visual Diagrams

Here is how Redis sits at the heart of the OrimaAI microservices ecosystem:

```
                                      ┌───────────────────────────────────────┐
                                      │         User Browser / Client         │
                                      └──────────────────┬────────────────────┘
                                                         │
                                    1. Cookie: session=UUID
                                                         ▼
                                      ┌───────────────────────────────────────┐
                                      │         API Gateway (Port 8000)       │
                                      └───────┬──────────────────────┬────────┘
                                              │                      │
                   2. Check session-${sessionId}                     │ 3. Forward with
                                              ▼                      │    Header: x-user-id
                                   ┌──────────────────────┐          │
                                   │  REDIS (In-Memory)   │ ◄────────┼─────────────────┐
                                   │      Port 6379       │          │                 │
                                   └──────────▲───────────┘          │                 │
                                              │                      │                 │
                      ┌───────────────────────┼──────────────────────┴────────┐        │
                      │                       │                               │        │
                      ▼                       ▼                               ▼        │
         ┌─────────────────────────┐ ┌─────────────────────────┐ ┌────────────────────┴────┐
         │       Auth Service      │ │      Agent Service      │ │     Billing Service     │
         │       (Port 5001)       │ │       (Port 5002)       │ │       (Port 5003)       │
         └────────────┬────────────┘ └────────────┬────────────┘ └────────────┬────────────┘
                      │                           │                           │
                      │                           │                           │
                      └───────────────────────────┼───────────────────────────┘
                                                  │
                                                  ▼
                                      ┌────────────────────────┐
                                      │    MongoDB Database    │
                                      │    (Persistent Disk)   │
                                      └────────────────────────┘
```

---

## 5. 🔑 Complete Redis Key-Space Schema in OrimaAI

Redis acts as a high-speed global key-value store. Here is every key format used in OrimaAI, what it stores, its data type, and its Time-To-Live (TTL):

| Key Format | Redis Type | Example Value | TTL | Responsible Service / File | Purpose & Lifecycle |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `session-${sessionId}` | **String (JSON)** | `{"userId":"64fa...","name":"Alex","email":"alex@test.com","plan":"pro","credits":250,"totalCredits":500,"planExpiresAt":"..."}` | **14 Days** (`1209600s`) | `auth.controller.js`, `gateway/auth.middleware.js` | Fast user authentication & permission checks. Eliminates MongoDB reads on every single HTTP request. |
| `user-session-${userId}` | **String (UUID)** | `"c29b7a44-8d2a-43c7-9b2f-3701235689ef"` | **14 Days** (`1209600s`) | `auth.controller.js` | Reverse index mapping MongoDB `userId` $\to$ `sessionId`. Allows Auth & Billing services to update the active session when plans change or credits are deducted. |
| `rate:${userId}:${agent}` | **String (Integer)** | `4` | **60 Seconds** (`60s`) | `agent/config/Limits.js` | Enforces rate limits per agent (Chat: 20/min, Coding: 5/min, Search: 8/min, PDF: 5/min, Image: 5/min). |
| `messages-${conversationId}` | **String (JSON Array)** | `[{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi there!"}]` | **48 Hours** (`172800s`) | `agent/config/getMemory.js` | Conversation memory buffer. Keeps a sliding window of the last 20 messages for LLM prompt context without hitting MongoDB. |

---

## 6. 🚀 Every Endpoint & Codeflow Interacting with Redis

### Workflow A: User Authentication & Session Creation (`POST /api/auth/login`)

```
Browser                     Gateway                   Auth Service                  Redis                   MongoDB
   │                           │                           │                          │                        │
   │─── 1. POST /api/auth/login ──────────> (Forward) ────>│                          │                        │
   │    { token: FirebaseJWT } │                           │── 2. verifyIdToken() ───>│                        │
   │                           │                           │                          │                        │
   │                           │                           │── 3. Find/Create User ───────────────────────────>│
   │                           │                           │<─ 4. Returns User Doc ────────────────────────────│
   │                           │                           │                          │                        │
   │                           │                           │── 5. Generate sessionId (UUID)                    │
   │                           │                           │── 6. SET user-session-${userId} ─────────>│       │
   │                           │                           │── 7. SET session-${sessionId} (14 days) ─>│       │
   │                           │                           │                          │                        │
   │<── 8. 200 OK + Set-Cookie: session=UUID ──────────────│                          │                        │
```

- **Implemented In**: [`server/services/auth/controllers/auth.controller.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/auth/controllers/auth.controller.js#L6-L58)
- **Endpoint**: `POST /api/auth/login`
- **What Happens**:
  1. The client sends a Firebase Google OAuth JWT token.
  2. The Auth Service verifies the Firebase token using `admin.auth().verifyIdToken()`.
  3. Looks up the user in MongoDB by `firebaseUid`. If not found, a new User document is created.
  4. Generates an unguessable cryptographic UUID: `const sessionId = crypto.randomUUID()`.
  5. Writes the reverse-lookup key to Redis with a 14-day TTL:
     ```javascript
     await redis.set(`user-session-${user._id}`, sessionId, "EX", 14 * 24 * 60 * 60);
     ```
  6. Serializes the user snapshot into Redis with a 14-day TTL:
     ```javascript
     await redis.set(`session-${sessionId}`, JSON.stringify({
       userId: user._id,
       name: user.name,
       email: user.email,
       avatar: user.avatar,
       plan: user.plan,
       credits: user.credits,
       totalCredits: user.totalCredits,
       planExpiresAt: user.planExpiresAt
     }), "EX", 14 * 24 * 60 * 60);
     ```
  7. Sends back an `httpOnly`, `sameSite: "strict"` cookie named `session` with a 14-day maxAge.

---

### Workflow B: API Gateway Request Interception (`protect` Middleware & `GET /api/me`)

```
Browser                     Gateway Middleware                  Redis                   Target Service
   │                               │                              │                           │
   │── 1. GET /api/chat/get-conv ──>│                              │                           │
   │   Cookie: session=UUID        │                              │                           │
   │                               │── 2. GET session-${UUID} ───>│                           │
   │                               │<─ 3. Returns User JSON ──────│                           │
   │                               │                              │                           │
   │                               │── 4. Injects x-user-id header ──────────────────────────>│
   │                               │      and forwards request    │                           │
```

- **Implemented In**: 
  - [`server/gateway/middleware/auth.middleware.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/gateway/middleware/auth.middleware.js)
  - [`server/gateway/utils/proxyWithHeader.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/gateway/utils/proxyWithHeader.js)
  - [`server/gateway/controller/user.controller.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/gateway/controller/user.controller.js)
- **Endpoints Protected**: `/api/chat/*`, `/api/agent/*`, `/api/billings/*`, and `/api/me`.
- **What Happens**:
  1. The browser sends any authenticated request with the `session` cookie.
  2. The Gateway `protect` middleware extracts `req.cookies?.session`.
  3. Queries Redis directly in RAM:
     ```javascript
     const session = await redis.get(`session-${sessionId}`);
     if (!session) return res.status(401).json({ message: "Unauthorized - session expired" });
     req.user = JSON.parse(session);
     ```
  4. If valid, `proxyWithHeader` decorates the proxied HTTP request with an internal security header:
     ```javascript
     proxyReqOpts.headers["x-user-id"] = req.user.userId;
     ```
  5. For `GET /api/me`, the Gateway immediately returns `req.user`. This endpoint powers the frontend user avatar, current credit count, and active plan with sub-millisecond response times!

---

### Workflow C: Dynamic Agent Rate Limiting (`POST /api/agent/chat` & `Limits.js`)

```
Agent Controller               Limits.js                      Redis                  LangGraph Execution
       │                           │                            │                             │
       │── 1. checkAgentLimit() ──>│                            │                             │
       │                           │── 2. INCR rate:user:chat ─>│                             │
       │                           │<─ 3. count = 1 ────────────│                             │
       │                           │── 4. EXPIRE key 60s ──────>│                             │
       │                           │                            │                             │
       │                           │── 5. TTL rate:user:chat ──>│                             │
       │                           │<─ 6. returns remaining TTL │                             │
       │                           │                            │                             │
       │   [If count <= limit]     │                            │                             │
       │<── 7. { remaining: 19 } ──│                            │                             │
       │─────────────────────────────────────────────────────────────────────────────────────>│
       │                                                                                      │
       │   [If count > limit]                                                                 │
       │<── 8. Throw 429 Too Many Requests (Reset in Xs)                                      │
```

- **Implemented In**: [`server/services/agent/config/Limits.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/agent/config/Limits.js)
- **Agent Limits**:
  - `chat`: 20 requests / minute
  - `coding`: 5 requests / minute
  - `search`: 8 requests / minute
  - `pdf`: 5 requests / minute
  - `image`: 5 requests / minute
  - `ppt`: 5 requests / minute
- **What Happens**:
  1. The controller calls `checkAgentLimit(userId, agent)`.
  2. Generates the Redis key: `rate:${userId}:${agent}`.
  3. Calls `const count = await redis.incr(key)`. If the key did not exist, Redis initializes it to `1`.
  4. If `count === 1`, it activates a 60-second window: `await redis.expire(key, 60)`.
  5. Queries `await redis.ttl(key)` to know the exact remaining seconds until reset.
  6. If `count > max`, it constructs a comprehensive HTTP 429 error payload:
     ```json
     {
       "success": false,
       "agent": "coding",
       "limit": 5,
       "remainingTime": 42,
       "retryAfter": "42s",
       "message": "You've reached the coding usage limit (5 requests). Your limit will reset in 42s."
     }
     ```
  7. If within limits, the request proceeds immediately to LangGraph multi-agent execution.

---

### Workflow D: 20-Turn Conversation Memory Window (`getMemory.js`)

```
Agent Node                    getMemory.js                     Redis                     Chat Service / MongoDB
    │                              │                             │                                 │
    │── 1. getMemory(convId) ─────>│                             │                                 │
    │                              │── 2. GET messages-${convId} │                                 │
    │                              │<─ 3. [Cache Hit] ───────────│                                 │
    │                              │      (or Cache Miss) ────────────────────────────────────────>│
    │                              │      (stores in Redis with 48h TTL) ─────────────────────────>│
    │<─ 4. Returns messages array ─│                             │                                 │
    │                              │                             │                                 │
    │ [Agent generates response]   │                             │                                 │
    │                              │                             │                                 │
    │── 5. addMessage(role, text) >│                             │                                 │
    │                              │── 6. Push message           │                                 │
    │                              │── 7. If length > 20: shift()│                                 │
    │                              │── 8. SETEX messages-${convId} 48h ───────────────────────────>│
```

- **Implemented In**: [`server/services/agent/config/getMemory.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/agent/config/getMemory.js)
- **Key**: `messages-${conversationId}`
- **TTL**: 48 Hours (`172800` seconds)
- **What Happens**:
  1. Before invoking LLM models (Gemini, Groq LLaMA), the agent needs previous conversational context.
  2. `getMemory(conversationId)` checks Redis key `messages-${conversationId}`:
     - **Cache Hit**: Parses and returns the JSON array in 0.3ms.
     - **Cache Miss**: Calls the Chat Service (`getMessages(conversationId)`), fetches messages from MongoDB, caches the result in Redis with a 48-hour expiration (`EX 172800`), and returns them.
  3. When an agent or user posts a new message, `addMessage(...)` appends the message:
     ```javascript
     messages.push({ role, content });
     if (messages.length > 20) {
       messages.shift(); // Evicts the oldest turn
     }
     await redis.set(key, JSON.stringify(messages), "EX", 48 * 60 * 60);
     ```
  4. This guarantees that token consumption remains bounded and prompts never overflow LLM context limits.

---

### Workflow E: Real-Time Credit Deduction (`POST /api/auth/deduct-credits`)

```
Agent Service (Node)           Auth Service                     MongoDB                     Redis
     │                              │                              │                          │
     │── 1. deductCredits(agent) ──>│                              │                          │
     │   POST /deduct-credits       │                              │                          │
     │                              │── 2. Check & Deduct Credits ─│                          │
     │                              │   user.credits -= cost       │                          │
     │                              │   user.save() ──────────────>│                          │
     │                              │                              │                          │
     │                              │── 3. GET user-session-${userId} ───────────────────────>│
     │                              │<─ 4. Returns sessionId ─────────────────────────────────│
     │                              │                              │                          │
     │                              │── 5. SET session-${sessionId} (Updated credits) ───────>│
     │                              │                              │                          │
     │<─ 6. 200 OK { credits } ─────│                              │                          │
```

- **Implemented In**:
  - Agent caller: [`server/services/agent/utils/deductCredits.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/agent/utils/deductCredits.js)
  - Auth handler: [`server/services/auth/controllers/auth.controller.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/auth/controllers/auth.controller.js#L112-L163)
- **Credit Costs**:
  - `chat`: 1 Credit
  - `search`: 5 Credits
  - `pdf`: 15 Credits
  - `image`: 15 Credits
  - `coding`: 20 Credits
- **What Happens**:
  1. Once an agent successfully finishes generating a response or artifact, it calls `deductCredits({ userId, agent })`.
  2. The Auth Service checks if the user has sufficient credits in MongoDB. If yes, it decrements `user.credits` and saves to disk.
  3. **The Redis Sync**: To ensure the user's frontend UI immediately reflects the new credit balance without forcing a re-login, Auth Service looks up the user's active session:
     ```javascript
     const sessionId = await redis.get(`user-session-${user._id}`);
     ```
  4. It immediately overwrites `session-${sessionId}` in Redis with the newly decremented credits.
  5. The next time the frontend queries `/api/me`, Redis serves the updated credit balance instantly!

---

### Workflow F: Razorpay Subscription & Plan Sync (`POST /api/billings/verify-payment`)

```
Frontend                    Billing Service                  Auth Service                   Redis
   │                               │                              │                           │
   │── 1. verify-payment ─────────>│                              │                           │
   │   { razorpay_signature }      │                              │                           │
   │                               │── 2. Validate HMAC SHA256    │                           │
   │                               │── 3. Payment.save("paid")    │                           │
   │                               │                              │                           │
   │                               │── 4. POST /update-plan ─────>│                           │
   │                               │      { plan, credits }       │── 5. Update MongoDB       │
   │                               │                              │── 6. GET user-session ───>│
   │                               │                              │<─ 7. Returns sessionId ───│
   │                               │                              │── 8. SET session-${id} ──>│
   │                               │                              │      (New Plan & Credits) │
   │<─ 9. Payment Verified ────────│                              │                           │
```

- **Implemented In**:
  - Billing controller: [`server/services/billing/controllers/billing.controller.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/billing/controllers/billing.controller.js#L41-L82)
  - Auth handler: [`server/services/auth/controllers/auth.controller.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/auth/controllers/auth.controller.js#L72-L110)
- **What Happens**:
  1. The user purchases a Pro or Enterprise subscription via Razorpay.
  2. The Billing Service validates the cryptographic Razorpay signature using `crypto.createHmac("sha256", secret)`.
  3. Marks the payment as `"paid"` in MongoDB.
  4. Dispatches an internal HTTP call to Auth Service:
     ```javascript
     await axios.post(`${process.env.AUTH_SERVICE}/update-plan`, {
       userId: payment.userId,
       plan: payment.plan,
       credits: payment.credits
     });
     ```
  5. The Auth Service updates the user document in MongoDB, fetches the active `sessionId` from `user-session-${userId}` in Redis, and pushes the new plan and credit balance to `session-${sessionId}`.
  6. The user instantly gains access to premium agents (Coding, PDF RAG, Image generation) without needing to refresh or log out.

---

### Workflow G: User Logout & Session Revocation (`GET /api/auth/logout`)

```
Browser                     Gateway                   Auth Service                  Redis
   │                           │                           │                          │
   │─── 1. GET /api/auth/logout ──────────> (Forward) ────>│                          │
   │    Cookie: session=UUID   │                           │                          │
   │                           │                           │── 2. DEL session-${UUID}>│
   │                           │                           │<─ 3. Key Removed (0.1ms)─│
   │                           │                           │                          │
   │<── 4. Clear-Cookie: session ──────────────────────────│                          │
```

- **Implemented In**: [`server/services/auth/controllers/auth.controller.js`](file:///c:/Users/Bikash%20Meher/OneDrive/Desktop/Cursor/New_Projects/OrimaAI/server/services/auth/controllers/auth.controller.js#L60-L70)
- **Endpoint**: `GET /api/auth/logout`
- **What Happens**:
  1. The user clicks "Log Out" in the application navbar.
  2. The browser forwards the `session` cookie to the Auth Service.
  3. Auth Service executes `await redis.del(\`session-${sessionId}\`)`.
  4. The session key is purged from RAM in under 0.1ms.
  5. Tells the browser to clear the cookie via `res.clearCookie("session")`.
  6. If an attacker had intercepted that session ID earlier, any future attempts to use it will immediately fail with `401 Unauthorized - session expired` at the Gateway `protect` middleware.

---

## 7. 📊 Visual Step-by-Step Sequence Graphs

### The Complete User Journey: From Login to Querying an Agent

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant GW as API Gateway (8000)
    participant Auth as Auth Service (5001)
    participant Redis as Redis (6379 - RAM)
    participant Agent as Agent Service (5002)
    participant Mongo as MongoDB (Disk)

    %% Step 1: Login
    Note over User, Redis: 1. Authentication Phase
    User->>GW: POST /api/auth/login (Firebase Token)
    GW->>Auth: Forward to Auth Service
    Auth->>Mongo: Find or Create User Record
    Mongo-->>Auth: User Record (id, credits: 100, plan: 'free')
    Auth->>Redis: SET user-session-${userId} = sessionId (TTL: 14d)
    Auth->>Redis: SET session-${sessionId} = UserJSON (TTL: 14d)
    Auth-->>User: Set-Cookie: session=sessionId; HttpOnly

    %% Step 2: Querying
    Note over User, Agent: 2. Authenticated Agent Query Phase
    User->>GW: POST /api/agent/chat (Cookie: session=sessionId)
    GW->>Redis: GET session-${sessionId}
    Redis-->>GW: UserJSON (userId, credits: 100)
    GW->>Agent: Forward POST /chat with header [x-user-id: userId]

    %% Step 3: Rate Limiting & Memory
    Note over Agent, Redis: 3. Rate Limit & Context Retrieval
    Agent->>Redis: INCR rate:userId:chat
    Redis-->>Agent: count = 1
    Agent->>Redis: EXPIRE rate:userId:chat 60s
    Agent->>Redis: GET messages-${conversationId}
    Redis-->>Agent: Cached 20-message array (Cache Hit)

    %% Step 4: AI Execution & Credit Deduction
    Note over Agent, Mongo: 4. Generation & Credit Sync
    Agent->>Agent: LangGraph Multi-Agent Execution (LLM Output)
    Agent->>Redis: Append message, trim to 20, SETEX 48h
    Agent->>Auth: POST /deduct-credits (userId, agent: 'chat')
    Auth->>Mongo: Decrement credits (credits = 99)
    Auth->>Redis: GET user-session-${userId} -> returns sessionId
    Auth->>Redis: SET session-${sessionId} -> UserJSON (credits: 99)
    Agent-->>User: Final AI Response Payload
```

---

## 8. 🛡️ Advanced Redis Patterns: Code Improvements & Production Hardening

While the current Redis implementation is clean, straightforward, and performant, here are the three recommended production enhancements for enterprise scale:

### 1. Atomic Rate Limiter with Redis Lua
Replace the two-step `INCR` + `EXPIRE` in `Limits.js` with an atomic Lua script to prevent orphaned keys without TTL if a node restarts:

```javascript
// Recommended Enterprise Rate Limiter
export const checkAgentLimitAtomic = async (userId, agent) => {
  const max = Limits[agent] || 20;
  const key = `rate:${userId}:${agent}`;

  const luaScript = `
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return current
  `;

  const count = await redis.eval(luaScript, 1, key, 60);
  const ttl = await redis.ttl(key);

  if (count > max) {
    const error = new Error(`Rate limit exceeded for ${agent}.`);
    error.status = 429;
    error.data = {
      limit: max,
      remainingTime: ttl,
      retryAfter: `${ttl}s`,
      message: `Limit exceeded. Try again in ${ttl}s.`
    };
    throw error;
  }

  return { remaining: Math.max(0, max - count), limit: max };
};
```

---

### 2. Atomic Conversation Memory with Redis Lists (`RPUSH` & `LTRIM`)
Instead of serializing a 20-element JSON string with `JSON.parse` and `JSON.stringify`, use Redis native Lists:

```javascript
// Atomic Conversation Memory Buffer
export const addMessageToList = async (conversationId, role, content) => {
  const key = `conv:messages:${conversationId}`;
  const payload = JSON.stringify({ role, content, timestamp: Date.now() });

  // Atomic Pipeline
  const pipeline = redis.pipeline();
  pipeline.rpush(key, payload);
  pipeline.ltrim(key, -20, -1); // Keep strictly the last 20 elements
  pipeline.expire(key, 48 * 60 * 60); // Refresh 48h TTL
  await pipeline.exec();
};

export const getMessagesFromList = async (conversationId) => {
  const key = `conv:messages:${conversationId}`;
  const rawList = await redis.lrange(key, 0, -1);
  return rawList.map((item) => JSON.parse(item));
};
```

---

### 3. Graceful Error Handling & Fallback
If Redis undergoes maintenance or drops connection, the application should not crash outright:

```javascript
// server/shared/redis/redis.js with Production Reconnection Logic
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    console.warn(`[Redis] Connection lost. Reconnecting in ${delay}ms... (Attempt ${times})`);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on("connect", () => console.log("✅ Redis connected successfully"));
redis.on("ready", () => console.log("🚀 Redis ready to receive operations"));
redis.on("error", (err) => console.error("❌ Redis Error:", err.message));
redis.on("close", () => console.warn("⚠️ Redis connection closed"));

export default redis;
```

---

## 9. 📖 Redis CLI & `ioredis` Quick Reference

### Most Common Operations in OrimaAI:

| Action | Redis CLI Command | `ioredis` Node.js Code |
| :--- | :--- | :--- |
| **Inspect a session** | `GET session-c29b7a44-8d2a` | `await redis.get("session-c29b7a44-8d2a")` |
| **Find user's session ID** | `GET user-session-64fa12...` | `await redis.get("user-session-64fa12...")` |
| **Check remaining rate limit TTL** | `TTL rate:64fa12...:chat` | `await redis.ttl("rate:64fa12...:chat")` |
| **Reset user's rate limit** | `DEL rate:64fa12...:coding` | `await redis.del("rate:64fa12...:coding")` |
| **View conversation buffer** | `GET messages-conv_987` | `await redis.get("messages-conv_987")` |
| **Manually invalidate session** | `DEL session-c29b7a44...` | `await redis.del("session-c29b7a44...")` |
| **Check Redis memory usage** | `INFO memory` | `await redis.info("memory")` |
| **Scan keys matching pattern** | `SCAN 0 MATCH session-* COUNT 20` | `await redis.scan(0, "MATCH", "session-*")` |

---

## 🎯 Summary

In OrimaAI, **Redis is not just a cache—it is the real-time distributed backbone of the entire microservices architecture**. It solves the four hardest problems in scalable web applications:
1. **Zero-Database Authentication**: Validates user sessions and permissions in sub-millisecond RAM speed at the Gateway.
2. **Deterministic Rate Limiting**: Protects expensive multi-agent LLMs from spam, DDoS, and API exhaustion.
3. **Low-Latency Conversational Memory**: Preserves context across multi-turn agent chats without incurring continuous database disk I/O.
4. **Instant Cross-Service Synchronization**: Ensures that credit deductions and subscription plan upgrades take effect instantaneously across all services without requiring a single client re-login.
