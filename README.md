# ACM AI

A modern chat application powered by Google's Gemini AI. Built with React and Express.

## What is this?

ACM AI is a full-stack chat application that allows users to interact with Google's Gemini AI. It features a sleek dark theme, markdown rendering for AI responses, and chat history functionality.

## Tech Stack

**Frontend:**
- React 19.2
- Vite
- React Markdown
- Space Mono (Font)

**Backend:**
- Express 5.2
- Google Generative AI SDK
- Node.js

## How to Run

### Prerequisites

- Node.js (v18 or higher)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
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
│   ├── gemini.js        # Gemini API integration
│   └── test-backend.js  # Backend tests
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Configuration

### Backend Port

Default port is `5000`. Change it in `.env`:
```env
PORT=5000
```

### CORS

CORS is configured for `http://localhost:5173`. To change it, edit `backend/server.js`.

## Troubleshooting

### "AI service failed" Error
- Check your `.env` file has `GEMINI_API_KEY`
- Verify API key is valid
- Check rate limits in Gemini dashboard

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using the port

---