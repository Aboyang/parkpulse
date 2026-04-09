# ParkPulse

<img width="422" height="813" alt="Screenshot 2026-04-09 at 1 28 43 PM" src="https://github.com/user-attachments/assets/268f30f3-32e1-45da-a485-7aedced758cc" />

## Project Setup

This project consists of a **React frontend** and a **Node.js backend**.
You need to have your own API keys for **OneMap** and **Data.gov.sg** before running the backend.

---

### Frontend (React)

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server (Vite):

```bash
npx vite --port 5173
```

* The frontend will be available at `http://localhost:5173`.

---

### Backend (Node.js)

1. Navigate to the backend folder:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend folder with the following environment variables:

```env
# OneMap Elastic Search API key
ONEMAP_API_KEY=YOUR_ONEMAP_API_KEY_HERE

# Data.gov.sg API key
DATA_GOV_API_KEY=YOUR_DATA_GOV_API_KEY_HERE
```

> **Note:** You must replace `YOUR_ONEMAP_API_KEY_HERE` and `YOUR_DATA_GOV_API_KEY_HERE` with your own API keys.
> You can obtain:
>
> * **OneMap API key** from [https://www.onemap.gov.sg/docs/](https://www.onemap.gov.sg/docs/)
> * **Data.gov.sg API key** from [https://data.gov.sg/developer](https://data.gov.sg/developer)

4. Start the backend server:

```bash
# Option 1: With nodemon (auto-restarts on changes)
nodemon server

# Option 2: With Node.js directly
node server
```

---

## Current Folder Structure
```plaintext
frontend/
├── components.json
├── eslint.config.js
├── index.html
├── jsconfig.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vite.config.js
├── entities/
│   ├── Carpark
│   ├── CarparkRating
│   └── SavedCarpark
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── pages.config.js
    ├── README.md
    ├── api/
    │   └── client.js
    ├── components/
    │   ├── UserNotRegisteredError.jsx
    │   ├── carpark/
    │   │   ├── CarparkCard.jsx
    │   │   ├── FilterPanel.jsx
    │   │   ├── MiniMap.jsx
    │   │   ├── PreferenceToggle.jsx
    │   │   ├── RadiusSlider.jsx
    │   │   ├── SearchBar.jsx
    │   │   └── StarRating.jsx
    │   └── ui/
    │       ├── accordion.jsx
    │       ├── alert-dialog.jsx
    │       ├── alert.jsx
    │       └── ...
    ├── hooks/
    │   └── use-mobile.jsx
    ├── lib/
    │   ├── config.js
    │   ├── PageNotFound.jsx
    │   ├── query-cilent.js
    │   └── utils.js
    ├── pages/
    │   ├── Auth.jsx
    │   ├── Detail.jsx
    │   ├── Home.jsx
    │   ├── Navigate.jsx
    │   ├── Rate.jsx
    │   ├── Results.jsx
    │   ├── Saved.jsx
    │   ├── SavePrompt.jsx
    │   └── ThankYou.jsx
    └── utils/
        └── index.ts

server/
├── client.js
├── package.json
├── server.js
├── config/
│   ├── nginx.config
│   └── redis.js
├── middlewares/
│   └── portMiddleware.js
├── routes/
│   ├── authRoute.js
│   ├── carparkRoute.js
│   ├── favoriteCarparkRoute.js
│   ├── locationRoute.js
│   └── rateCarparkRoute.js
├── services/
│   ├── authService.js
│   ├── carparkService.js
│   ├── locationService.js
│   ├── favoriteCarparkService.js
│   └── rateCarparkService.js
└── utils/
    ├── carparkDB.js
    └── coordConverter.js
```
