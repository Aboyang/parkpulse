# Smart Carpark — Singapore Parking Finder

A mobile-first web application that helps drivers find, navigate to, and rate carparks across Singapore in real time.

---

## Overview

Smart Carpark aggregates live carpark data from multiple Singapore government data sources, geocodes the user's destination, filters nearby carparks by radius and preference, provides turn-by-turn navigation, and lets users rate and save their favourite carparks.

---

## Application Flow

### 1. Home (`/Home`)
The entry point. The user:
- Types a destination into the **SearchBar** (backed by the OneMap autocomplete API).
- Optionally selects **ERP-Free** or **EV Charging** preferences via toggles.
- Adjusts the **search radius** (200 m – 3 km) with a slider.
- Presses **Find Nearby Carparks** → navigates to `/Results` with all options encoded in URL query parameters (`q`, `erp`, `ev`, `radius`, `lat`, `lng`, `t`).

If the user has previously saved carparks, they can navigate to `/Saved` via a link at the bottom.

---

### 2. Results (`/Results`)
Displays a filtered, sorted list and a mini-map of nearby carparks.

**Geocoding** (`lib/geocode.js`):
- The destination string is first sent to the **OneMap search API** (most accurate for Singapore addresses, postal codes, and building names).
- Falls back to **Nominatim (OpenStreetMap)** if OneMap returns no results.
- Falls back to a large built-in dictionary of known Singapore places (HDB towns, MRT stations, shopping malls, hospitals, landmarks).
- Falls back to fuzzy MRT station name matching.

**Data fetching** (`lib/carparkService.js`):
- **HDB dataset** — fetched via the data.gov.sg CKAN API with full pagination (up to 2,263 records across multiple pages of 500). Coordinates are in SVY21 projection and converted to WGS84 using `lib/svy21.js`. Live availability (lots available / total) is merged in from the HDB Carpark Availability API.
- **OneMap search** — queries `"{location} carpark"` across all result pages to supplement HDB data with newer towns (e.g. Punggol, Sengkang East) that are not yet in the HDB static dataset. Returns WGS84 coordinates directly.
- Both sources are fetched **in parallel**. HDB results are **cached in memory for 5 minutes**. Results are **deduplicated** (any two carparks within 40 m are treated as the same physical carpark; the HDB record is preferred as it carries live availability data).

**Filtering & sorting** (client-side, in Results):
- Haversine distance is calculated from the resolved centre to each carpark.
- Only carparks within the chosen radius are kept.
- ERP-zone and EV-charging filters are applied if selected.
- Results are sorted nearest-first; the top 50 are displayed.

**MiniMap** (`components/carpark/MiniMap.jsx`):
- Rendered with **React Leaflet** using CartoDB dark tiles (no API key required).
- Each carpark appears as a clickable marker; clicking navigates to the Detail page.

---

### 3. Detail (`/Detail?id=…`)
Shows full information for a single carpark.

- Looks up the carpark from the in-memory live dataset (via React Query cache).
- Also queries the app database for any stored **user ratings** and merges them.
- Displays: name, availability (colour-coded green/amber/red by percentage), operating hours, parking system type, short-term availability, and feature badges (EV Charging, 24/7 Surveillance, Mobile Payment, Free Parking).
- A static Leaflet map shows the carpark's location.
- **Confirm Selection** → navigates to `/Navigate`.

---

### 4. Navigate (`/Navigate?id=…`)
Turn-by-turn navigation to the selected carpark.

- Attempts to get the user's **real GPS position** via the browser Geolocation API; falls back to a simulated offset from the destination.
- Fetches a **road-snapped route** from the **OSRM public routing API** (driving mode, full geometry + step-by-step instructions).
- If OSRM fails, falls back to a straight-line interpolation.
- Simulates vehicle movement along the route (one polyline point every 1.5 seconds).
- The **turn instruction banner** updates based on proximity to each maneuver waypoint.
- Displays live **ETA**, **remaining distance**, and **time** in the bottom bar.
- On arrival (within 30 m of destination), shows an **arrival overlay** and prompts the user to rate the carpark.

---

### 5. Rate (`/Rate?id=…`)
Post-arrival feedback form.

- User selects a 1–5 star rating and optionally leaves a comment.
- On submit: creates a `CarparkRating` record in the database, then recalculates and updates the `average_rating` and `total_ratings` on the `Carpark` record.
- Navigates to `/SavePrompt`.

---

### 6. SavePrompt (`/SavePrompt?id=…`)
Asks the user whether to save this carpark to their favourites.

- **Save** → creates a `SavedCarpark` record → navigates to `/ThankYou`.
- **Skip** → navigates directly to `/ThankYou`.

---

### 7. ThankYou (`/ThankYou`)
Simple confirmation screen with a **Return to Home** button.

---

### 8. Saved (`/Saved`)
Lists all saved carparks for the current user.

- Fetched from the `SavedCarpark` entity, sorted by most recently saved.
- Each entry has a **navigate** button (→ Detail page) and a **delete** button.

---

## Data Sources

| Source | URL | Notes |
|--------|-----|-------|
| HDB Carpark Info | `data.gov.sg` CKAN API (`d_23f946fa…`) | 2,263 records; SVY21 coords; paginated |
| HDB Carpark Availability | `api.data.gov.sg/v1/transport/carpark-availability` | Live lots; refreshed every minute |
| OneMap Search | `onemap.gov.sg/api/common/elastic/search` | WGS84; no auth required for search |
| OSRM Routing | `router.project-osrm.org` | Free public instance; driving profile |
| Map Tiles | CartoDB Dark Matter | No API key required |
| Geocoding (fallback) | Nominatim (OpenStreetMap) | Free; no key required |

---

## Coordinate System

Singapore's HDB dataset uses the **SVY21** local coordinate system (Transverse Mercator projection, origin at Pierce Reservoir). The `lib/svy21.js` module converts SVY21 `(Northing, Easting)` grid values to **WGS84 `(latitude, longitude)`** using the standard inverse-TM series expansion.

---

## Database Entities

| Entity | Purpose |
|--------|---------|
| `Carpark` | Stores user-contributed data: average rating, total ratings |
| `CarparkRating` | One record per user rating submission (carpark ID, stars, comment) |
| `SavedCarpark` | One record per saved carpark per user (carpark ID, name, coordinates) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| Data Fetching | TanStack React Query v5 |
| Maps | React Leaflet + Leaflet.js |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Key Files

```
src/
├── pages/
│   ├── Home.jsx          # Search + preferences entry point
│   ├── Results.jsx       # Filtered carpark list + mini map
│   ├── Detail.jsx        # Single carpark info + navigation CTA
│   ├── Navigate.jsx      # Turn-by-turn navigation view
│   ├── Rate.jsx          # Post-arrival star rating form
│   ├── SavePrompt.jsx    # Save-to-favourites prompt
│   ├── Saved.jsx         # Saved carparks list
│   └── ThankYou.jsx      # Confirmation screen
├── components/
│   └── carpark/
│       ├── SearchBar.jsx       # OneMap-powered autocomplete input
│       ├── CarparkCard.jsx     # Result list item card
│       ├── MiniMap.jsx         # Leaflet map with carpark markers
│       ├── PreferenceToggle.jsx # ERP / EV toggle switch
│       ├── RadiusSlider.jsx    # Search radius selector
│       └── StarRating.jsx      # Interactive star rating widget
├── lib/
│   ├── carparkService.js  # Multi-source data fetch, dedup, cache
│   ├── geocode.js         # OneMap → Nominatim → known places lookup
│   ├── svy21.js           # SVY21 → WGS84 coordinate converter
│   └── config.js          # API URLs, app constants
└── entities/
    ├── Carpark.json        # Schema: average rating, total ratings
    ├── CarparkRating.json  # Schema: carpark_id, rating, comment
    └── SavedCarpark.json   # Schema: carpark_id, name, coordinates
``
