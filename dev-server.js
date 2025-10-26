// Simple static server to expose sibling repos from parent folder.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const root = path.resolve('..');
const port = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url).pathname;
  // Normalize path and ensure it stays within the root
  const filePath = path.resolve(root, '.' + parsed); // adding '.' prevents absolute path injection
  // Optionally resolve symlinks:
  // const realFilePath = await fs.realpath(filePath);
  if (!filePath.startsWith(root + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200);
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
