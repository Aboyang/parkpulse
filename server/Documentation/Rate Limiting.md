# Rate Limiting

IP-based rate limiting is applied to all API routes using a sliding fixed-window counter backed by Redis.

## How it works

`middlewares/rateLimitMiddleware.ts` exports `createRateLimiter({ label, limit })`, a factory that returns an Express middleware. Each middleware instance tracks requests per IP using a Redis key with the format:

```
rl:<label>:<ip>:<window-bucket>
```

The window bucket is `Math.floor(epoch_seconds / 60)` — it increments every 60 seconds, giving a new window each minute. The Redis key is set with a 90-second TTL (30 s longer than the window) so keys clean themselves up after the window closes.

`incrementCounter` in `config/redis.ts` atomically increments the key and sets its TTL on first use (using `INCR` + `EXPIRE`).

### Fail-open behaviour

If Redis is unreachable, the middleware logs the error and calls `next()` — requests are never blocked due to infrastructure failure.

## Response headers

Every rate-limited response includes:

| Header | Value |
|---|---|
| `X-RateLimit-Limit` | The configured limit for this route |
| `X-RateLimit-Remaining` | Requests left in the current window (0 when blocked) |
| `Retry-After` | Seconds until the current window closes (only on 429) |

A blocked request returns `HTTP 429` with body:

```json
{ "error": "Too many requests. Please try again later." }
```

## Route limits

Limits are configured in `server.ts` and applied before the routers mount:

| Route | Label | Limit (req/min per IP) |
|---|---|---|
| `POST /api/auth/login` | `auth_login` | 5 |
| `POST /api/auth/signup` | `auth_signup` | 3 |
| `POST /api/auth/confirm` | `auth_confirm` | 5 |
| `GET /api/carparks` | `carparks` | 15 |
| `GET /api/navigate` | `navigate` | 30 |
| `GET /api/location` | `location` | 20 |
| `/api/favorites` | `favorites` | 20 |
| `/api/rating` | `rating` | 10 |

Auth endpoints are tightest because they are the most abuse-prone (credential stuffing, account enumeration). Carpark and location endpoints are higher because they are read-heavy and used by the map UI on every search.

## Testing

Unit tests are in `tests/rateLimitMiddleware.test.ts`. They mock `config/redis.ts` and cover:

- Requests under the limit call `next()` and set the correct `X-RateLimit-Remaining` header.
- Requests over the limit return 429 with `Retry-After` and `X-RateLimit-Remaining: 0`.
- `X-RateLimit-Limit` is set on every request regardless of outcome.
- Redis errors cause the middleware to fail open (calls `next()`, no 429).
- IP fallback chain: `req.ip` → `req.socket.remoteAddress` → `"unknown"`.
- Redis key includes the correct label and window bucket.

Run with:

```bash
cd server
npx vitest run tests/rateLimitMiddleware.test.ts
```

## Manual smoke test

`scripts/attack-rate-limit.sh` fires bursts of requests against a running server and prints HTTP status codes. Use it to verify limits are enforced end-to-end with a real Redis instance:

```bash
# Start the server first
npm run dev

# In another terminal
bash server/scripts/attack-rate-limit.sh http://localhost:3000
```

The script hits `GET /api/carparks` 18 times (limit 15) and then dumps the rate-limit headers from a blocked `POST /api/auth/login` request.
