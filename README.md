**CampusKart 🛒**

Full‑stack MERN campus marketplace where students can buy and sell items, chat in real time, and manage listings.

**Tech Stack**

Frontend: React, React Router, Axios, MUI

Backend: Node.js, Express, MongoDB (Atlas), JWT auth, Socket.io

**Deployment:**

Client: Vercel (https://campus-kart-mern.vercel.app)

Server: Render (https://campuskart-mern.onrender.com)

**Features**

User registration and login with JWT authentication.

Create, update, delete and browse product listings.

Image upload support for listings (if implemented).

Real‑time chat between buyers and sellers using Socket.io.

Responsive UI built with Material UI components.

**Project Structure**

campus-kart-mern/
├── client/           # React frontend
│   ├── src/
│   │   ├── api.js   # Axios instance
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
├── server/           # Node/Express backend
│   ├── src/ or /    # your server entry (e.g. index.js / server.js)
│   ├── models/
│   ├── routes/
│   └── ...
├── README.md
└── ...


Environment Variables
Backend (Render)

Create an .env file locally and corresponding environment variables in Render:

PORT=5001,

MONGO_URI=your_mongodb_connection_string,

JWT_SECRET=someverysecretkey,

CLIENT_URL=https://campus-kart-mern.vercel.app,


**Example CORS setup in Express:**

js
import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "https://campus-kart-mern.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

**
Frontend (Vercel)**
In Vercel project settings, add:

REACT_APP_API_URL=https://campuskart-mern.onrender.com/api
Frontend Setup

Inside client/:

npm install

npm start

client/package.json should keep the proxy for local development:

json
"proxy": "http://localhost:5001"
src/api.js:

js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api", // /api uses proxy locally
  withCredentials: true, // if using cookies
});

export default api;
Backend Setup
Inside server/ (or the folder where your Express app lives):

bash
npm install
npm run dev   # or npm start
Backend will run on http://localhost:5001 by default.

Deployment
Backend (Render)
Create a new Web Service from your GitHub repo.

Set environment variables as listed above.

Build command: npm install

Start command: npm start

Frontend (Vercel)
Import the same repo into Vercel.

Set REACT_APP_API_URL in Environment Variables.

Deploy; main domain will be https://campus-kart-mern.vercel.app.

**Scripts**

Client

npm start   # start React dev server

npm run build  # build production bundle

**Server**


npm start      # start server

npm run dev    # dev mode with nodemon (if configured)

**Future Improvements**

Add search and filters for products.

Add user profile pages and ratings.

Integrate payment gateway (test mode)
