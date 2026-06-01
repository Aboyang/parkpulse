# Request Coalescing

## Problem

Redis caching eliminates repeated upstream calls for the same query once a result is stored, but it does not help the first wave of concurrent requests — those that all arrive while the cache is cold (or just expired). Without coalescing, 10 simultaneous requests for `Raffles Place / 500m` would each independently call OneMap and data.gov.sg before any of them had a chance to populate the cache.

## How it works

`services/carparkService.ts` holds a module-level map:

```ts
const inFlightRequests = new Map<string, Promise<EnrichedCarpark[]>>();
```

When `findCarparks(address, radius, evCharging)` is called, it builds a key from the three parameters:

```ts
const coalescingKey = `${address}:${radius}:${evCharging}`;
```

If a Promise for that key is already in the map, the caller joins it directly — no second upstream round-trip is started:

```ts
if (inFlightRequests.has(coalescingKey)) {
  return inFlightRequests.get(coalescingKey)!;
}
```

Otherwise, the real work is kicked off via `doFindCarparks()` and its Promise is registered:

```ts
const requestPromise = this.doFindCarparks(address, radius, evCharging);
inFlightRequests.set(coalescingKey, requestPromise);
```

The entry is removed once the Promise settles (both success and failure):

```ts
requestPromise.finally(() => {
  inFlightRequests.delete(coalescingKey);
});
```

Removing on failure means a rejected Promise is never reused — the next caller gets a fresh attempt.

## Relationship to Redis caching

The two mechanisms operate at different points in the request lifecycle and complement each other:

| | Redis cache | Request coalescing |
|---|---|---|
| Scope | Cross-request, cross-process | Single process, in-flight only |
| Covers | Cache-hit requests (TTL window) | Cold-start burst (first request after miss) |
| Storage | Redis key/value | In-memory `Map` |
| Lifetime | 120 s TTL | Duration of one upstream call |

A typical cache-miss sequence under load:

1. Request A arrives → cache miss → `doFindCarparks` starts, Promise stored in map.
2. Requests B–N arrive while A is still in-flight → all join A's Promise.
3. A settles → result written to Redis → map entry deleted.
4. Subsequent requests hit Redis directly, never reaching the coalescing layer.

## Scope and limitations

Coalescing is in-process only. In the load-balanced setup (5 Node instances behind Nginx), each process has its own `inFlightRequests` map. A burst spread across multiple instances will still result in up to one upstream call per instance. Redis caching handles cross-process deduplication after the first process has written its result.
