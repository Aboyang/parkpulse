import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { createRateLimiter } from '../middlewares/rateLimitMiddleware.js';

vi.mock('../config/redis.js', () => ({
  incrementCounter: vi.fn(),
}));

import { incrementCounter } from '../config/redis.js';

const mockedIncrementCounter = vi.mocked(incrementCounter);

function makeReq(ip = '1.2.3.4'): Partial<Request> {
  return { ip, socket: { remoteAddress: ip } as never };
}

function makeRes(): { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> } {
  const res = {
    set: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next() and sets remaining header when under limit', async () => {
    mockedIncrementCounter.mockResolvedValue(3);
    const middleware = createRateLimiter({ label: 'test', limit: 10 });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await middleware(req as Request, res as unknown as Response, next as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '7');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 429 with Retry-After when limit is exceeded', async () => {
    mockedIncrementCounter.mockResolvedValue(11);
    const middleware = createRateLimiter({ label: 'test', limit: 10 });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await middleware(req as Request, res as unknown as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests. Please try again later.' });
    const retryAfterCall = res.set.mock.calls.find(([header]) => header === 'Retry-After');
    expect(retryAfterCall).toBeDefined();
    expect(Number(retryAfterCall![1])).toBeGreaterThan(0);
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
  });

  it('sets X-RateLimit-Limit on every request', async () => {
    mockedIncrementCounter.mockResolvedValue(1);
    const middleware = createRateLimiter({ label: 'test', limit: 15 });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await middleware(req as Request, res as unknown as Response, next as NextFunction);

    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', '15');
  });

  it('fails open when Redis throws', async () => {
    mockedIncrementCounter.mockRejectedValue(new Error('Redis connection lost'));
    const middleware = createRateLimiter({ label: 'test', limit: 10 });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await middleware(req as Request, res as unknown as Response, next as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('uses socket.remoteAddress as fallback when req.ip is undefined', async () => {
    mockedIncrementCounter.mockResolvedValue(1);
    const middleware = createRateLimiter({ label: 'test', limit: 10 });
    const req: Partial<Request> = { ip: undefined, socket: { remoteAddress: '9.8.7.6' } as never };
    const res = makeRes();
    const next = vi.fn();

    await middleware(req as Request, res as unknown as Response, next as NextFunction);

    const keyArg: string = mockedIncrementCounter.mock.calls[0][0];
    expect(keyArg).toContain('9.8.7.6');
  });

  it('uses "unknown" when both ip fields are undefined', async () => {
    mockedIncrementCounter.mockResolvedValue(1);
    const middleware = createRateLimiter({ label: 'test', limit: 10 });
    const req: Partial<Request> = { ip: undefined, socket: { remoteAddress: undefined } as never };
    const res = makeRes();
    const next = vi.fn();

    await middleware(req as Request, res as unknown as Response, next as NextFunction);

    const keyArg: string = mockedIncrementCounter.mock.calls[0][0];
    expect(keyArg).toContain('unknown');
  });

  it('passes correct label and window bucket in Redis key', async () => {
    mockedIncrementCounter.mockResolvedValue(1);
    const middleware = createRateLimiter({ label: 'auth_login', limit: 5 });
    const req = makeReq('203.0.113.1');
    const res = makeRes();
    const next = vi.fn();

    await middleware(req as Request, res as unknown as Response, next as NextFunction);

    const keyArg: string = mockedIncrementCounter.mock.calls[0][0];
    expect(keyArg).toMatch(/^rl:auth_login:203\.0\.113\.1:\d+$/);
  });
});
