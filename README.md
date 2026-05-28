# Distributed Web Crawler (Google Search Crawler)

A full-stack application for distributed web crawling and search indexing, built with a Node.js/Express backend and a React/Vite frontend. This project simulates search engine behaviors by crawling websites, indexing their content, and providing a search interface with keyword suggestions.

## 🌐 Live Demo

- **Frontend (Vercel)**: [https://websearcher-tau.vercel.app/](https://websearcher-tau.vercel.app/)
- **Backend API (Render)**: [https://websearcher-p0lw.onrender.com](https://websearcher-p0lw.onrender.com)

## 🚀 Features

- **Web Crawling**: Uses Puppeteer and Cheerio to crawl websites, mimicking a real browser to fetch dynamic content.
- **Search Engine**: MongoDB text indexing provides robust search capabilities with relevance scoring.
- **Keyword Extraction & Suggestions**: Automatically extracts keywords from crawled pages and provides real-time autocomplete suggestions during search.
- **Duplicate Detection**: Prevents re-crawling of the same URLs.
- **Role-based APIs**: Separate API routes for Users, Admins, and Authors.
- **Modern UI**: Frontend built with React 19, Tailwind CSS, and Zustand for state management.

## 🛠️ Tech Stack

### Backend
- **Node.js & Express**: API framework.
- **MongoDB & Mongoose**: Database and ODM for storing page data, users, and crawl queues.
- **Puppeteer & Cheerio**: Headless browser automation and HTML parsing for crawling.
- **Authentication**: JWT (JSON Web Tokens) and bcrypt.

### Frontend
- **React & Vite**: Fast frontend framework and build tool.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Zustand**: Lightweight state management.
- **React Router**: For navigation.
- **Lucide React**: Icon library.

## 📁 Project Structure

```
.
├── BACKEND/          # Node.js Express server
│   ├── Api/          # API Controllers/Routes (Admin, User, Author)
│   ├── Middleware/   # Express middlewares
│   ├── Models/       # Mongoose Schemas (Page, User, CrawlQueue)
│   ├── Services/     # Business logic (CrawlerService, SearchService, etc.)
│   └── Server.js     # Entry point
└── FRONTEND/         # React + Vite application
    ├── src/          # Source code for React
    ├── public/       # Static assets
    └── vite.config.js
```

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "Distributed Web Crawler (Google Search Crawler) project"
```

### 2. Backend Setup
```bash
cd BACKEND
npm install
```
Create a `.env` file in the `BACKEND` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../FRONTEND
npm install
```
Start the frontend development server:
```bash
npm run dev
```

## 🔍 How It Works

1. **Crawling**: The `CrawlerService` uses Puppeteer to navigate to a provided URL, waits for the network to idle, and extracts the HTML. Cheerio is then used to parse the title, domain, description, content, and links. It also filters out common stop words to identify key terms.
2. **Indexing**: Extracted data is stored in MongoDB. The `PageModel` utilizes MongoDB's `$text` index on the content and title to support efficient search queries.
3. **Searching**: The `SearchService` queries the MongoDB text index and returns paginated results sorted by text match score. It also powers the keyword autocomplete feature.

## 📄 License
ISC License
