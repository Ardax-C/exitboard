const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { PrismaClient } = require('@prisma/client');

// Setup logging that Azure can capture
function log(message) {
  const timestamp = new Date().toISOString();
  process.stdout.write(`${timestamp} - ${message}\n`);
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

// Initialize Prisma client with detailed logging
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log startup configuration
process.stdout.write('================== SERVER STARTUP ==================\n');
process.stdout.write(`Environment: ${process.env.NODE_ENV}\n`);
process.stdout.write(`Hostname: ${hostname}\n`);
process.stdout.write(`Port: ${port}\n`);
process.stdout.write(`Database URL set: ${process.env.DATABASE_URL ? 'Yes' : 'No'}\n`);
process.stdout.write(`Database URL length: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0}\n`);
process.stdout.write(`JWT Secret set: ${process.env.JWT_SECRET ? 'Yes' : 'No'}\n`);
process.stdout.write(`API URL: ${process.env.NEXT_PUBLIC_API_URL}\n`);
process.stdout.write('================================================\n');

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function checkDatabaseConnection() {
  try {
    process.stdout.write('Attempting database connection...\n');
    await prisma.$connect();
    process.stdout.write('Database connection successful\n');
    
    // Test query to verify full connectivity
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_schema()`;
    process.stdout.write(`Database info: ${JSON.stringify(result)}\n`);
    
    return true;
  } catch (error) {
    process.stdout.write('================== DATABASE ERROR ==================\n');
    process.stdout.write(`Error name: ${error.name}\n`);
    process.stdout.write(`Error message: ${error.message}\n`);
    if (error.code) process.stdout.write(`Error code: ${error.code}\n`);
    if (error.meta) process.stdout.write(`Error metadata: ${JSON.stringify(error.meta)}\n`);
    process.stdout.write(`Full error: ${JSON.stringify(error)}\n`);
    process.stdout.write('================================================\n');
    return false;
  }
}

app.prepare()
  .then(async () => {
    process.stdout.write('Next.js app prepared, checking database connection...\n');
    
    // Check database connection before starting server
    const isDatabaseConnected = await checkDatabaseConnection();
    if (!isDatabaseConnected) {
      throw new Error('Failed to connect to database - check logs above for details');
    }

    process.stdout.write('Creating HTTP server...\n');
    
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        const startTime = Date.now();
        
        process.stdout.write(`${new Date().toISOString()} - ${req.method} ${req.url}\n`);
        
        await handle(req, res, parsedUrl);
        
        const duration = Date.now() - startTime;
        process.stdout.write(`${new Date().toISOString()} - ${req.method} ${req.url} completed in ${duration}ms\n`);
      } catch (err) {
        process.stdout.write(`Error handling request: ${err.message}\n`);
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
      process.stdout.write(`> Ready on http://${hostname}:${port}\n`);
      
      // Send ready signal to Azure
      if (process.send) {
        process.send('ready');
      }
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', async () => {
      process.stdout.write('SIGTERM received, shutting down...\n');
      
      try {
        // Disconnect Prisma
        await prisma.$disconnect();
        process.stdout.write('Database connection closed\n');
        
        server.close(() => {
          process.stdout.write('Server closed\n');
          process.exit(0);
        });
      } catch (error) {
        process.stdout.write(`Error during shutdown: ${error.message}\n`);
        process.exit(1);
      }
      
      // Force exit if server doesn't close in 10 seconds
      setTimeout(() => {
        process.stdout.write('Could not close server gracefully, forcing shutdown\n');
        process.exit(1);
      }, 10000);
    });
  })
  .catch((err) => {
    process.stdout.write(`Error during app preparation: ${err.message}\n`);
    process.exit(1);
  }); 