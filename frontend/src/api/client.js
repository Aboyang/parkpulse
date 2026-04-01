const STORAGE_KEYS = {
  currentUser: 'parkpulse_current_user',
  savedCarparks: 'parkpulse_saved_carparks',
  carparkRatings: 'parkpulse_carpark_ratings',
  carparks: 'parkpulse_carparks',
};

const nowIso = () => new Date().toISOString();
const createId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
  let user = readJson(STORAGE_KEYS.currentUser, null);
  if (!user) {
    user = { id: 'local-user', name: 'Guest User', role: 'user' };
    writeJson(STORAGE_KEYS.currentUser, user);
  }
  return user;
}

function upsertCarpark(carpark) {
  if (!carpark?.id) return;
  const carparks = readJson(STORAGE_KEYS.carparks, []);
  const index = carparks.findIndex((c) => c.id === carpark.id);
  const next = {
    ...carpark,
    updated_date: nowIso(),
    created_date: carparks[index]?.created_date || nowIso(),
  };
  if (index >= 0) {
    carparks[index] = { ...carparks[index], ...next };
  } else {
    carparks.push(next);
  }
  writeJson(STORAGE_KEYS.carparks, carparks);
}

export const db = {
  auth: {
    async me() {
      return getCurrentUser();
    },
    logout() {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    },
    redirectToLogin() {
      window.location.href = '/Home';
    },
  },
  entities: {
    Carpark: {
      async filter(where = {}) {
        const carparks = readJson(STORAGE_KEYS.carparks, []);
        if (!where || Object.keys(where).length === 0) return carparks;
        return carparks.filter((item) =>
          Object.entries(where).every(([key, value]) => item?.[key] === value)
        );
      },
      async update(id, payload = {}) {
        const carparks = readJson(STORAGE_KEYS.carparks, []);
        const idx = carparks.findIndex((c) => c.id === id);
        if (idx >= 0) {
          carparks[idx] = { ...carparks[idx], ...payload, updated_date: nowIso() };
        } else {
          carparks.push({ id, ...payload, created_date: nowIso(), updated_date: nowIso() });
        }
        writeJson(STORAGE_KEYS.carparks, carparks);
        return carparks.find((c) => c.id === id);
      },
    },
    SavedCarpark: {
      async list(order = '-created_date') {
        const items = readJson(STORAGE_KEYS.savedCarparks, []);
        const sorted = [...items].sort((a, b) =>
          new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
        );
        return order === '-created_date' ? sorted : sorted.reverse();
      },
      async create(payload = {}) {
        const existing = readJson(STORAGE_KEYS.savedCarparks, []);
        const duplicate = existing.find((x) => x.carpark_id === payload.carpark_id);
        if (duplicate) return duplicate;
        const created = {
          id: createId('saved'),
          ...payload,
          created_date: nowIso(),
          updated_date: nowIso(),
        };
        existing.push(created);
        writeJson(STORAGE_KEYS.savedCarparks, existing);
        upsertCarpark({
          id: payload.carpark_id,
          name: payload.carpark_name,
          latitude: payload.latitude,
          longitude: payload.longitude,
        });
        return created;
      },
      async delete(id) {
        const items = readJson(STORAGE_KEYS.savedCarparks, []);
        writeJson(
          STORAGE_KEYS.savedCarparks,
          items.filter((item) => item.id !== id)
        );
        return { id };
      },
    },
    CarparkRating: {
      async create(payload = {}) {
        const ratings = readJson(STORAGE_KEYS.carparkRatings, []);
        const created = {
          id: createId('rating'),
          ...payload,
          created_date: nowIso(),
          updated_date: nowIso(),
        };
        ratings.push(created);
        writeJson(STORAGE_KEYS.carparkRatings, ratings);
        return created;
      },
    },
  },
};
