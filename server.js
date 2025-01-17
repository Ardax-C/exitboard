const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.WEBSITE_HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

console.log('Starting Next.js app...');
console.log(`Environment: ${dev ? 'development' : 'production'}`);
console.log(`Hostname: ${hostname}`);
console.log(`Port: ${port}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    console.log('Next.js app prepared');
    
    createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        console.log(`Incoming request: ${req.method} ${req.url}`);
        
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    })
    .listen(port, (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        throw err;
      }
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error during app preparation:', err);
    process.exit(1);
  }); 