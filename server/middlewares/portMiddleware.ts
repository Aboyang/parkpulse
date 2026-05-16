// Testing load balancing by logging the port number for each request

import type { Request, Response, NextFunction } from "express";

export const portLogger = (req: Request, res: Response, next: NextFunction): void => {
  const port = process.env.PORT ?? "3000";

  req.serverPort = port;

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (typeof body === "object" && body !== null) {
      (body as Record<string, unknown>).port = port;
    }
    return originalJson(body as Parameters<typeof originalJson>[0]);
  }) as typeof res.json;

  next();
};
