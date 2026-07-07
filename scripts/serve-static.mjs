import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const rootDir = process.cwd();
const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const host = process.env.HOST ?? '127.0.0.1';

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(message);
}

function resolveRequestPath(requestUrl = '/') {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  const rawPath = decodeURIComponent(url.pathname);
  const routePath = rawPath === '/' ? '/index.html' : rawPath;
  const absolutePath = path.resolve(rootDir, `.${routePath}`);
  const rootWithSeparator = rootDir.endsWith(path.sep) ? rootDir : `${rootDir}${path.sep}`;

  if (absolutePath !== rootDir && !absolutePath.startsWith(rootWithSeparator)) {
    return null;
  }

  return absolutePath;
}

async function getServedFilePath(absolutePath) {
  const fileStats = await stat(absolutePath);
  if (!fileStats.isDirectory()) return absolutePath;

  const indexPath = path.join(absolutePath, 'index.html');
  await access(indexPath);
  return indexPath;
}

const server = createServer(async (request, response) => {
  try {
    const absolutePath = resolveRequestPath(request.url);
    if (!absolutePath) {
      sendText(response, 403, 'Forbidden');
      return;
    }

    const filePath = await getServedFilePath(absolutePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': mimeTypes.get(extension) ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    sendText(response, error.code === 'ENOENT' ? 404 : 500, error.code === 'ENOENT' ? 'Not found' : 'Server error');
  }
});

server.listen(port, host, () => {
  console.log(`Serving ${rootDir} at http://${host}:${port}/`);
});
