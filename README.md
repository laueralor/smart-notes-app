# Smart Notes Application

This is a full-stack web application designed for intelligent note management. The project combines a modern user interface with advanced Artificial Intelligence capabilities, such as automated content tagging, AI-generated executive summaries using cloud LLMs, and an interactive local semantic search and Q&A engine based on text vectorization.

## Architecture Overview

The application follows a decoupled client-server architecture:
* **Frontend:** Built with React and Vite, using modern state management (useState, useEffect) and native asynchronous fetching.
* **Backend:** Developed using Node.js and Express, implementing a RESTful API with stateless JWT authentication.
* **Database:** MongoDB Atlas used for cloud persistence of user credentials and vectorized note documents.
* **AI Engine:** Hybrid implementation using Groq Cloud API (Llama 3.1) for server-side generation features, and Xenova Transformers for local CPU vector embeddings and similarity computations.

---

## Technical Features

### 1. Authentication & Security
* **Stateless Sessions:** Implements JSON Web Tokens (JWT) for secure, token-based authentication.
* **Password Hashing:** Uses bcryptjs with salt generation (10 rounds) to encrypt user passwords before database persistence.
* **Route Protection:** A custom middleware interceptor (authMiddleware.js) validates tokens in the HTTP authorization headers before allowing access to private resources.

### 2. Artificial Intelligence Generation
* **Automated Tag Extraction:** When a user creates or updates a note, the content is analyzed by the Groq API (llama-3.1-8b-instant) to extract exactly three relevant keywords formatted as raw JSON.
* **Executive AI Summaries:** The backend automatically generates a concise one-to-two sentence summary for every note, making it easier to review long texts from the main dashboard.
* **Graceful Degradation:** The backend includes a fallback mechanism. If the external Groq API key fails or expires, a local text-processing algorithm takes over to generate fallback tags, preventing application downtime.

### 3. Semantic Search Engine & RAG
* **Local Text Embeddings:** The system imports the @xenova/transformers pipeline locally to convert note content into a 384-dimensional dense vector using the Xenova/all-MiniLM-L6-v2 model.
* **Cosine Similarity Matcher:** Instead of traditional keyword matching, the application computes the Dot Product between normalized vectors to sort results by contextual and semantic relevance.
* **"Ask Your Notes" (Retrieval-Augmented Generation):** Users can ask conversational questions about their notes. The system fetches the top 3 contextually relevant documents in local CPU, injects them as a strict knowledge boundary into the cloud LLM prompt, and returns a veridical answer free of hallucinations.

---

## Installation and Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Environment Configuration
Create a .env file inside the backend folder with the following configuration variables:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
OPENAI_API_KEY=your_groq_api_key
JWT_SECRET=your_fallback_secure_string

## Installation Steps
### 1. Clone or download the repository.
### 2. Install the backend dependencies:
cd backend
npm install

### Install the frontend dependencies:
cd ../frontend
npm install

## How to run the Application
Navigate to the backend directory and run the monitor environment:
npx nodemon index.js
Open a second terminal, navigate to the frontend directory, and run the Vite development server:
npm run dev
