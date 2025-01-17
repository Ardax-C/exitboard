const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Setup logging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  console.log(logMessage);
  
  // Also write to a file that Azure can collect
  fs.appendFileSync('/home/LogFiles/application.log', logMessage);
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

log(`Starting server with configuration:
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
    log('Attempting database connection...');
    await prisma.$connect();
    log('Database connection successful');
    
    // Test query to verify full connectivity
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_schema()`;
    log('Database info: ' + JSON.stringify(result));
    
    return true;
  } catch (error) {
    log('Database connection error details:');
    log('Error name: ' + error.name);
    log('Error message: ' + error.message);
    if (error.code) log('Error code: ' + error.code);
    if (error.meta) log('Error metadata: ' + JSON.stringify(error.meta));
    log('Full error: ' + JSON.stringify(error));
    return false;
  }
}

app.prepare()
  .then(async () => {
    log('Next.js app prepared, checking database connection...');
    
    // Check database connection before starting server
    const isDatabaseConnected = await checkDatabaseConnection();
    if (!isDatabaseConnected) {
      throw new Error('Failed to connect to database - check logs above for details');
    }

    log('Creating HTTP server...');
    
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        const startTime = Date.now();
        
        log(`${req.method} ${req.url}`);
        
        await handle(req, res, parsedUrl);
        
        const duration = Date.now() - startTime;
        log(`${req.method} ${req.url} completed in ${duration}ms`);
      } catch (err) {
        log('Error handling request: ' + err.message);
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
      log(`> Ready on http://${hostname}:${port}`);
      
      // Send ready signal to Azure
      if (process.send) {
        process.send('ready');
      }
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', async () => {
      log('SIGTERM received, shutting down...');
      
      try {
        // Disconnect Prisma
        await prisma.$disconnect();
        log('Database connection closed');
        
        server.close(() => {
          log('Server closed');
          process.exit(0);
        });
      } catch (error) {
        log('Error during shutdown: ' + error.message);
        process.exit(1);
      }
      
      // Force exit if server doesn't close in 10 seconds
      setTimeout(() => {
        log('Could not close server gracefully, forcing shutdown');
        process.exit(1);
      }, 10000);
    });
  })
  .catch((err) => {
    log('Error during app preparation: ' + err.message);
    process.exit(1);
  }); 