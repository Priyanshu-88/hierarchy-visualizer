# BFHL – SRM Full Stack Engineering Challenge

A full-stack web application that analyzes directed graph hierarchies, detects cycles, builds tree structures, and displays results in an elegant UI.

Backend url - https://agent-69eb74fc57964f0e18--hierarchy-visualizer01.netlify.app
Frontend url - 

## 📁 Project Structure

```
bajaj/
├── backend/
│   ├── server.js              # Express entry point
│   ├── package.json
│   ├── routes/
│   │   └── bfhl.js            # POST /bfhl route handler
│   └── utils/
│       ├── validator.js       # Input validation & deduplication
│       ├── graphBuilder.js    # Adjacency list & root detection
│       ├── cycleDetector.js   # DFS cycle detection
│       └── treeBuilder.js     # Nested tree construction
├── frontend/
│   ├── index.html             # Main HTML page
│   ├── style.css              # Dark theme design system
│   └── script.js              # Frontend logic & rendering
└── README.md
```

## 🚀 Getting Started

### Backend

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3000`.

### Frontend

Open `frontend/index.html` directly in your browser, or serve it:

```bash
cd frontend
npx -y serve .
```

## 🔌 API Endpoint

### POST `/bfhl`

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D", "C->E"]
}
```

**Response:**
```json
{
  "user_id": "priyanshu_24042026",
  "email_id": "priyanshu@example.com",
  "college_roll_number": "SRMXXXXXX",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": { "D": {} },
          "C": { "E": {} }
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## 🧪 Testing with cURL

```bash
curl -X POST http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["A->B", "A->C", "B->D", "X->Y", "Y->X", "hello"]}'
```

## 🌐 Deployment

### Backend (Render / Railway)

1. Push the `backend/` folder to a GitHub repository.
2. Create a new **Web Service** on [Render](https://render.com) or Railway.
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variable:** `PORT=3000` (usually auto-set)

### Frontend (Vercel / Netlify)

1. Push the `frontend/` folder to a GitHub repository.
2. Deploy on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Update the API URL in the frontend input to point to your deployed backend.

## ✨ Features

- **Input Validation** – Validates `X->Y` format, catches self-loops, non-uppercase, malformed entries
- **Duplicate Detection** – Identifies and reports repeated edges
- **Graph Building** – Constructs adjacency list with single-parent enforcement
- **Cycle Detection** – DFS-based three-color marking algorithm
- **Tree Construction** – Nested JSON tree output with depth computation
- **Multi-hierarchy** – Handles disconnected components independently
- **Beautiful UI** – Dark glassmorphism theme with gradient accents and micro-animations
