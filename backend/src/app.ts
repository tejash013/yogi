import type { IncomingMessage, ServerResponse } from 'http';

export const app = (req: IncomingMessage, res: ServerResponse) => {
  if (req.url === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Not Found');
};
