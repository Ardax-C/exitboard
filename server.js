const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

// Initialize Prisma client with detailed logging
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Add query logging
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});

console.log(`Starting server with configuration:
- Environment: ${process.env.NODE_ENV}
- Hostname: ${hostname}
- Port: ${port}
- Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}
- Database URL length: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0}
- JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}
- API URL: ${process.env.NEXT_PUBLIC_API_URL}
`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function checkDatabaseConnection() {
  try {
    console.log('Attempting database connection...');
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Test query to verify full connectivity
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_schema()`;
    console.log('Database info:', result);
    
    return true;
  } catch (error) {
    console.error('Database connection error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.meta) console.error('Error metadata:', error.meta);
    console.error('Full error:', error);
    return false;
  }
}

app.prepare()
  .then(async () => {
    console.log('Next.js app prepared, checking database connection...');
    
    // Check database connection before starting server
    const isDatabaseConnected = await checkDatabaseConnection();
    if (!isDatabaseConnected) {
      throw new Error('Failed to connect to database - check logs above for details');
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
      
      try {
        // Disconnect Prisma
        await prisma.$disconnect();
        console.log('Database connection closed');
        
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
      
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