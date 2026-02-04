# ACM AI

A Taboo-style word guessing game powered by OpenAI. Built with React and Express.

## What is this?

ACM AI is a full-stack chat application where you play a Taboo-style guessing game against an AI. Give clues (without using taboo words) and the AI will guess your target word. It features a sleek dark theme, markdown rendering, and chat history functionality.

## Tech Stack

**Frontend:**
- React 19.2
- Vite
- Tailwind CSS
- React Markdown
- Lucide React (icons)

**Backend:**
- Express 5.2
- OpenAI SDK
- Node.js

## How to Run

### Prerequisites

- Node.js (v18 or higher)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   OPENAI_API_KEY=your_api_key_here
   PORT=5000
   ```

3. **Start the servers**

   **Terminal 1 - Backend:**
   ```bash
   npm run server
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

4. **Open browser**
   
   Navigate to `http://localhost:5173`

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run server` | Start backend server |
| `npm run server:dev` | Start backend with auto-reload |
| `npm run build` | Build for production |
| `npm run test:backend` | Run backend tests |

## Project Structure

```
acmai/
├── frontend/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── backend/
│   ├── server.js        # Express backend server
│   ├── openai.js        # OpenAI API integration
│   ├── .env             # Environment variables (create this)
│   └── test-backend.js  # Backend tests
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Configuration

### Backend Port

Default port is `5000`. Change it in `backend/.env`:
```env
PORT=5000
```

### CORS

CORS is configured for `http://localhost:5173`. To change it, edit `backend/server.js`.

## Troubleshooting

### "AI service failed" Error
- Check your `backend/.env` file has `OPENAI_API_KEY`
- Verify API key is valid
- Check rate limits in OpenAI dashboard

### Port Already in Use
- Change `PORT` in `backend/.env` file
- Or kill the process using the port

---