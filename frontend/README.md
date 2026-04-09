## ParkPulse Frontend

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
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── pages.config.js
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
```

--

## Description

### **src/components/**

* **UserNotRegisteredError.jsx** – UI component to display an error when a user hasn’t registered.
* **carpark/** – Components related to carparks:

  * **CarparkCard.jsx** – Displays info about a carpark (name, availability, rating).
  * **FilterPanel.jsx** – UI panel for filtering carparks based on criteria.
  * **MiniMap.jsx** – Shows a small map, possibly with the carpark location.
  * **PreferenceToggle.jsx** – Toggle for user preferences (like favorite carparks).
  * **RadiusSlider.jsx** – Slider to set search radius for carparks.
  * **SearchBar.jsx** – Input to search carparks by name or location.
  * **StarRating.jsx** – Displays or allows users to rate a carpark with stars.
* **ui/** – Generic UI components:

  * **accordion.jsx** – Collapsible panels for showing/hiding content.
  * **alert-dialog.jsx** – Modal for warnings or confirmations.
  * **alert.jsx** – Simple notification alert messages.
  * **…** – Other reusable UI elements.

---

### **src/hooks/**

* **use-mobile.jsx** – Custom React hook to detect if the user is on a mobile device; can adjust UI or behavior.

---

### **src/lib/**

* **config.js** – App-level configuration, e.g., API URLs or constants.
* **PageNotFound.jsx** – 404 page component for unmatched routes.
* **query-cilent.js** – Likely a typo for `query-client.js`; probably sets up React Query or a similar data-fetching client.
* **utils.js** – Generic helper functions used across the app.

---

### **src/pages/**

These are **route-level components**, each representing a full page:

* **Auth.jsx** – Login or registration page.
* **Detail.jsx** – Page showing detailed info about a carpark.
* **Home.jsx** – Landing or dashboard page.
* **Navigate.jsx** – Page for navigation directions to a carpark.
* **Rate.jsx** – Page for submitting ratings for a carpark.
* **Results.jsx** – Search results page for carparks.
* **Saved.jsx** – Page showing saved/favorited carparks.
* **SavePrompt.jsx** – UI for prompting users to save a carpark.
* **ThankYou.jsx** – Confirmation or thank-you page after a user action.

---
