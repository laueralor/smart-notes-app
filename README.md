# Smart Notes Application (AI & Semantic RAG)

Full-stack web application for intelligent note management that integrates Generative AI, local vector embeddings, and Retrieval-Augmented Generation (RAG) for semantic search and interactive Q&A.

---

## Architecture Overview

The system follows a decoupled client-server architecture:

* **Frontend:** Built with **React** and **Vite**, using modular state hooks and asynchronous data fetching.
* **Backend:** RESTful API built on **Node.js** and **Express**, featuring stateless authentication.
* **Database:** **MongoDB Atlas** for persistence of user credentials and vectorized note documents.
* **AI Engine:** Hybrid architecture leveraging **Groq Cloud API (Llama 3.1)** for generative tasks and **Xenova Transformers** for local CPU embeddings.

---

## Technical Features

### 1. Authentication & Security
* **Stateless Sessions:** JWT (JSON Web Tokens) for role and session management.
* **Password Hashing:** Salted hashing with `bcryptjs` (10 rounds) before persistence.
* **Route Protection:** Custom middleware interceptor (`authMiddleware.js`) validating authorization headers.

### 2. Generative AI Capabilities
* **Automated Tag Extraction:** Asynchronous analysis of note content via Llama 3.1 to generate contextual JSON tags.
* **Executive Summaries:** Automated generation of concise overviews for long-form entries.
* **Graceful Degradation:** Local text-processing fallback mechanism in case of API rate limits or network failures.

### 3. Semantic Search Engine & RAG
* **Local Embeddings:** Generates 384-dimensional dense vectors on CPU via `Xenova/all-MiniLM-L6-v2`.
* **Cosine Similarity Matcher:** Dot-product computation over normalized vectors for context-aware sorting.
* **"Ask Your Notes" (RAG):** Retrieves the top-3 relevant context chunks to augment prompts, delivering grounded responses without hallucinations.

---

## Stack Tecnológico

* **Frontend:** React, Vite, HTML5, CSS3, JavaScript (ES6+)
* **Backend:** Node.js, Express.js, JWT, Bcryptjs
* **Database:** MongoDB Atlas, Mongoose
* **AI / ML:** Llama 3.1 (Groq API), Transformers.js, Vector Embeddings

---

## Installation & Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB Atlas** instance or local URI
* **Groq API Key**

### 1. Environment Configuration

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
OPENAI_API_KEY=your_groq_api_key
JWT_SECRET=your_fallback_secure_string
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Run the Application

```bash
# Terminal 1 - Run Backend (from /backend)
npx nodemon index.js

# Terminal 2 - Run Frontend (from /frontend)
npm run dev
```

---

## Contributors (ERASMUS)

* **Laura Eraso Lorenzo** ([@laueralor](https://github.com/laueralor))
* **Javier Muela Rubio** [@muelean](https://github.com/muelean)
