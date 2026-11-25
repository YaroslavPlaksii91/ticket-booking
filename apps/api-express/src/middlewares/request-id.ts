import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const HEADER = 'x-request-id';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.get(HEADER);
  const id = incoming && incoming.length <= 100 ? incoming : randomUUID();

  req.id = id;
  res.setHeader(HEADER, id);

  next();
}
