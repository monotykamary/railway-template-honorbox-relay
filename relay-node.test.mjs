import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer, request } from 'node:http';
import test from 'node:test';

import { MAX_BODY_BYTES, serveNodeRequest } from './relay-node.mjs';

test('oversized bodies receive HTTP 413 without buffering the remainder', async (t) => {
  const server = createServer(serveNodeRequest);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());

  const address = server.address();
  assert.notEqual(address, null);
  assert.equal(typeof address, 'object');

  const body = Buffer.alloc(MAX_BODY_BYTES + 1);
  const response = await new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        path: '/',
        method: 'POST',
        headers: {
          'content-length': body.length,
          'stripe-signature': 'invalid',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          body: Buffer.concat(chunks).toString('utf8'),
        }));
      },
    );
    req.on('error', reject);
    req.end(body);
  });

  assert.deepEqual(response, {
    statusCode: 413,
    body: 'payload too large',
  });
});
