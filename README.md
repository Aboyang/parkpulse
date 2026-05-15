# ParkPulse

ParkPulse SG allows you to locate nearest carparks to your destination, view their real-time slot availability, and navigate to them.

<img width="140" height="272" alt="Screenshot 2026-04-09 at 1 28 43 PM" src="https://github.com/user-attachments/assets/268f30f3-32e1-45da-a485-7aedced758cc" />

<img width="140" height="272" alt="Screenshot 2026-04-09 at 1 44 42 PM" src="https://github.com/user-attachments/assets/afb99759-207e-421d-8077-19d5fd68b113" />

<img width="140" height="272" alt="Screenshot 2026-04-09 at 1 44 56 PM" src="https://github.com/user-attachments/assets/8e335403-562b-455b-a79d-2bfecdb8b9ec" />

<img width="140" height="272" alt="Screenshot 2026-04-09 at 1 45 10 PM" src="https://github.com/user-attachments/assets/e67dc71f-339f-471e-bdff-c2ad4a538ff3" />

<img width="140" height="272" alt="Screenshot 2026-04-09 at 1 45 48 PM" src="https://github.com/user-attachments/assets/7c286399-d11f-406f-888a-6db9e8f69153" />

Watch video demo here: https://youtu.be/AdSQKVfwq1s

---

## Prerequisites

- [Node.js 24](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Setup

### 1. Configure environment variables

Create a `.env` file in the **project root**:

```bash
cp server/.env.example .env
```

Fill in the values:

```env
# OneMap geocoding
ONEMAP_API_KEY=

# data.gov.sg carpark availability
DATA_GOV_API_KEY=

# HDB carpark dataset
DATASET_ID=d_23f946fa557947f93a8043bbef41dd09

# AWS credentials
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-1

# AWS Cognito
USER_POOL_ID=
APP_CLIENT_ID=
APP_CLIENT_SECRET=
```

Where to get the keys:
- **OneMap API key** — [onemap.gov.sg/docs](https://www.onemap.gov.sg/docs/)
- **Data.gov.sg API key** — [data.gov.sg/developer](https://data.gov.sg/developer)
- **AWS credentials** — [AWS IAM console](https://console.aws.amazon.com/iam/)

---

### 2. Start the backend (Docker)

The backend runs as three services — the Node.js server (scalable), Nginx (load balancer), and Redis (cache).

```bash
cd server
docker compose up --build --scale server=3
```

| Service | Exposed at |
|---------|-----------|
| API (via Nginx) | `http://localhost:8080` |
| Redis | internal only |

To stop:
```bash
docker compose down
```

---

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and talks to the backend at `http://localhost:8080`.

---

## Running without Docker (local dev)

If you prefer to run the backend directly without Docker, you need Redis running locally first.

```bash
# Start Redis (macOS with Homebrew)
brew services start redis

# Start the backend
cd server
npm install
node server.js
```

The backend will be available at `http://localhost:3000`. Update `VITE_API_BASE_URL` in your `.env` or `frontend/src/lib/config.js` if needed.

---

## Project Structure

```plaintext
.
├── .env                            # environment variables (not committed)
├── frontend/                       # React 18 + Vite SPA
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── pages/
│       │   ├── Auth.jsx            # login / signup
│       │   ├── Home.jsx            # search + radius + EV filter
│       │   ├── Carparks.jsx        # search results list
│       │   ├── Carpark.jsx         # individual carpark detail
│       │   ├── Navigate.jsx        # turn-by-turn navigation
│       │   ├── Saved.jsx           # saved / favourite carparks
│       │   ├── SavePrompt.jsx      # prompt to save after viewing
│       │   ├── Rate.jsx            # submit a rating
│       │   └── ThankYou.jsx
│       ├── components/
│       │   ├── carpark/
│       │   │   ├── CarparkCard.jsx
│       │   │   ├── FilterPanel.jsx
│       │   │   ├── MiniMap.jsx
│       │   │   ├── PreferenceToggle.jsx
│       │   │   ├── RadiusSlider.jsx
│       │   │   ├── SearchBar.jsx
│       │   │   └── StarRating.jsx
│       │   └── ui/                 # shadcn/Radix primitives (button, badge, dialog, …)
│       ├── lib/
│       │   ├── config.js           # API_BASE_URL + app-wide constants
│       │   └── query-cilent.js     # TanStack Query provider setup
│       └── hooks/
│           └── use-mobile.jsx
└── server/                         # Express 5 API
    ├── Dockerfile
    ├── docker-compose.yml          # server (×N) + nginx + redis
    ├── server.js                   # entry point, mounts all routers
    ├── config/
    │   ├── nginx.docker.conf       # Nginx load balancer config (Docker)
    │   ├── nginx.config            # Nginx config for local multi-instance setup
    │   └── redis.js                # Redis client + getCache / setCache helpers
    ├── routes/
    │   ├── carparkRoute.js         # GET /api/carparks
    │   ├── authRoute.js            # POST /api/auth/signup|login|logout
    │   ├── favoriteCarparkRoute.js # GET|POST|DELETE /api/favorites
    │   ├── rateCarparkRoute.js     # GET|POST /api/rating
    │   ├── locationRoute.js        # GET /api/location
    │   └── navigateRoute.js        # GET /api/navigate/route
    ├── services/
    │   ├── carparkService.js       # geocode + filter + availability + rating join
    │   ├── authService.js          # Cognito USER_PASSWORD_AUTH flow
    │   ├── favoriteCarparkService.js
    │   ├── rateCarparkService.js
    │   ├── locationService.js
    │   └── navigateService.js
    ├── models/
    │   ├── carpark.js              # entity: toDB / fromDB / toJSON, SVY21 distance
    │   ├── carparkAvailability.js
    │   ├── carparkRating.js
    │   ├── favoriteCarpark.js
    │   ├── location.js
    │   └── user.js
    ├── db/
    │   ├── dynamoClient.js         # DynamoDB DocumentClient singleton
    │   ├── dynamoAdapter.js        # get / put / delete wrappers
    │   └── index.js
    ├── middlewares/
    │   └── portMiddleware.js       # injects serving port into responses (load balancing debug)
    ├── utils/
    │   ├── carparkDB.js            # static HDB carpark dump (SVY21 coords)
    │   └── coordConverter.js       # SVY21 ↔ lat/lon via proj4 EPSG:3414
    └── tests/
        ├── carparkService.test.js
        ├── favoriteCarparkService.test.js
        ├── locationService.test.js
        └── rateCarparkService.test.js
```
