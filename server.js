const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

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

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

app.prepare()
  .then(async () => {
    console.log('Next.js app prepared, checking database connection...');
    
    // Check database connection before starting server
    const isDatabaseConnected = await checkDatabaseConnection();
    if (!isDatabaseConnected) {
      throw new Error('Failed to connect to database');
    }

    console.log('Creating HTTP server...');
    
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        const startTime = Date.now();
        
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        
        await handle(req, res, parsedUrl);
        
        const duration = Date.now() - startTime;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url} completed in ${duration}ms`);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: 'Internal Server Error', 
          message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
        }));
      }
    });

    // Extend timeouts for Azure
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    server.listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
      
      // Send ready signal to Azure
      if (process.send) {
        process.send('ready');
      }
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down...');
      
      // Disconnect Prisma
      await prisma.$disconnect();
      console.log('Database connection closed');
      
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
      
      // Force exit if server doesn't close in 10 seconds
      setTimeout(() => {
        console.error('Could not close server gracefully, forcing shutdown');
        process.exit(1);
      }, 10000);
    });
  })
  .catch((err) => {
    console.error('Error during app preparation:', err);
    process.exit(1);
  }); 