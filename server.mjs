import { createServer } from 'node:http';
import { serveNodeRequest } from './relay-node.mjs';

const port = Number(process.env.PORT || 8787);

createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end('{"status":"ok"}');
    return;
  }
  void serveNodeRequest(req, res);
}).listen(port, '0.0.0.0', () => {
  console.log(`HonorBox webhook relay listening on :${port}`);
});
