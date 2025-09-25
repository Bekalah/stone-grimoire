import http from 'node:http';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const root = path.resolve('..');
const port = process.env.PORT || 8080;

function isSafeLocalPath(p) {
  // Must start with a single "/" and not contain ".." or backslash, and not be an absolute URL
  return (
    typeof p === "string" &&
    p.startsWith("/") &&
    !p.includes("..") &&
    !p.includes("\\") &&
    !/^https?:\/\//i.test(p)
  );
}

const server = http.createServer(async (req, res) => {
  const reqUrl = url.parse(req.url).pathname;
  const filePath = path.join(root, reqUrl);
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      if (isSafeLocalPath(reqUrl)) {
        res.writeHead(302, {Location: reqUrl.replace(/\/?$/, '/') + 'index.html'});
      } else {
        res.writeHead(302, {Location: '/'});
      }
      res.end();
      return;
    }
    const data = await fs.readFile(filePath);
    res.writeHead(200);
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Dev server running on http://localhost:${port}/`);
});
