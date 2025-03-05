/**
 * Local development server
 * Allows testing the Lambda function locally
 */
const http = require('http');
const { handler } = require('./index');
const logger = require('./src/utils/logger');

// Create a simple HTTP server
const server = http.createServer(async (req, res) => {
    try {
        // Only handle POST requests to /api/semantic-search
        if (req.method === 'POST' && req.url === '/api/semantic-search') {
            // Read the request body
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    // Create a mock Lambda event
                    const event = {
                        body,
                        httpMethod: 'POST',
                        path: '/api/semantic-search',
                        headers: req.headers
                    };
                    
                    // Create a mock Lambda context
                    const context = {
                        awsRequestId: 'local-' + Date.now(),
                        functionName: 'sharingan-semantic-search-local',
                        functionVersion: 'local',
                        memoryLimitInMB: '128'
                    };
                    
                    // Call the Lambda handler
                    const response = await handler(event, context);
                    
                    // Set the response headers
                    res.statusCode = response.statusCode || 200;
                    if (response.headers) {
                        Object.keys(response.headers).forEach(key => {
                            res.setHeader(key, response.headers[key]);
                        });
                    }
                    
                    // Send the response
                    res.end(response.body);
                } catch (error) {
                    logger.error('Error handling request', { error: error.message });
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            });
        } else {
            // Return 404 for all other requests
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    } catch (error) {
        logger.error('Unhandled server error', { error: error.message });
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Local development server running at http://localhost:${PORT}`);
    logger.info(`Send POST requests to http://localhost:${PORT}/api/semantic-search`);
});