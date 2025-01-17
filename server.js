const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

console.log(`Starting server with configuration:
- Environment: ${process.env.NODE_ENV}
- Hostname: ${hostname}
- Port: ${port}
- Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}
- JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}
- API URL: ${process.env.NEXT_PUBLIC_API_URL}
`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    console.log('Next.js app prepared, creating HTTP server...');
    
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
      }
    });

    server.keepAliveTimeout = 65000; // Extend keep-alive timeout
    server.headersTimeout = 66000; // Extend headers timeout

    server.listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
      
      // Send ready signal to Azure
      if (process.send) {
        process.send('ready');
      }
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error('Error during app preparation:', err);
    process.exit(1);
  }); 