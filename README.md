# VEDA AI
An AI-powered platform that helps teachers generate assignments and exam papers with intelligent question generation, persistent storage, and support for multiple assessment formats.

The platform supports various question types including MCQs, short answer, long answer, numerical, and descriptive/architectural questions, allowing educators to create structured assessments in seconds. Assignments are permanently stored, can be regenerated anytime, and are generated through carefully engineered AI workflows for reliable and structured outputs.

Built with a scalable full-stack architecture using Next.js, Node.js, Redis queues, LangChain, and Groq, the system processes assignment generation asynchronously while maintaining reliable AI responses through queue-based workflows, retry mechanisms, and fallback model providers.

---

## 🚀 Features

- Generate AI-powered assignments and exam papers
- Supports multiple question types:
  - MCQs
  - Short Answer Questions
  - Long Answer Questions
  - Numerical Problems
  - Architectural / Descriptive Questions
- Real-time assignment generation progress using WebSockets
- Persistent assignment storage
- Regenerate assignments instantly
- AI-generated answer keys
- Download generated papers and solutions
- Queue-based background processing for scalability
- Structured JSON-based AI responses
- Retry mechanism for failed generations
- Fallback model provider support
- Clean and responsive modern UI

---

# 🏗️ System Architecture

The application follows an asynchronous AI generation pipeline:

1. Teacher creates an assignment request
2. Backend stores assignment metadata in MongoDB
3. Assignment job is pushed into BullMQ queue
4. Worker consumes the queue job
5. AI pipeline generates structured questions using LLMs
6. Progress events are streamed to the frontend through WebSockets
7. Final assignment and answer key are persisted
8. User can view, regenerate, or download the generated paper

---

# 🧠 AI Pipeline

The backend uses a structured AI workflow powered by LangChain and Groq.

### AI Generation Features

- Carefully engineered prompts for consistent outputs
- JSON-structured responses for reliable parsing
- Retry handling for malformed outputs
- Fallback LLM provider support
- Queue-based execution for stability under load
- Real-time progress streaming to frontend

---

# 🖥️ Frontend

Built with modern frontend tooling for performance and scalability.

## Tech Stack

- Next.js
- TypeScript
- Redux Toolkit
- RTK Query
- Zustand
- Tailwind CSS
- WebSockets

## Frontend Features

- Real-time progress UI
- Assignment management dashboard
- Persistent state management
- Optimized API caching with RTK Query
- Modern responsive design
- Download support for generated content

---

# ⚙️ Backend

Designed as a scalable asynchronous AI generation service.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Redis
- BullMQ
- LangChain
- Groq API
- WebSockets

## Backend Responsibilities

- Queue management
- AI orchestration
- Assignment persistence
- Retry handling
- WebSocket event streaming
- Structured response validation

---

# 📂 Project Structure

```bash
root/
│
├── client/        # Next.js frontend
│
└── server/        # Express backend

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/UvYadav04/Veda-AI.git
cd Veda-AI
```

---

# 🖥️ Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd client
npm install
```

### Build the Frontend

```bash
npm run build
```

### Start the Production Server

```bash
npm run start
```

Frontend will run on:

```bash
http://localhost:3000
```

---

# ⚙️ Backend Setup

Open a new terminal and navigate to the backend directory:

```bash
cd server
npm install
```

### Start the Development Server

```bash
npm run dev
```

Backend will run on:

```bash
http://localhost:5000
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `server/` directory.

```env
PORT=5000
MONGODB_URI=mongodb+srv://....
REDIS_URL=redis://....

PRIMARY_PROVIDER=groq
PRIMARY_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=******************
GEMINI_API_KEY=*****************

FALLBACK_PROVIDER=openai
FALLBACK_MODEL=gpt-4o-mini
OPENAI_API_KEY=**************
```

Create a `.env` file inside the `client/` directory.
```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000
```
---

# 🧰 Prerequisites

Make sure the following services are installed and running locally:

- Node.js (v18+ recommended)
- MongoDB
- Redis

---

# 📦 Production Build Notes

- Frontend uses optimized production builds via Next.js
- Backend runs independently as a Node.js + Express service
- Redis is used for BullMQ queue processing
- WebSockets power real-time assignment generation progress

---

# 🧠 Development Workflow

The platform follows an asynchronous AI generation pipeline:

1. Teacher creates an assignment
2. Backend stores metadata in MongoDB
3. Job is pushed into BullMQ queue
4. Worker processes AI generation
5. Progress is streamed via WebSockets
6. Generated assignment and answer key are persisted
7. User can regenerate or download assignments anytime

---

# 🛠️ Common Commands

## Frontend

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Start production server
```

## Backend

```bash
npm run dev      # Start backend in development mode
```
