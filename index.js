/**
 * Main Lambda handler
 * Entry point for the AWS Lambda function
 */
const { processRequest } = require('./src/handlers/semanticSearch');
const logger = require('./src/utils/logger');

/**
 * AWS Lambda handler function
 * @param {Object} event - The Lambda event object
 * @param {Object} context - The Lambda context object
 * @returns {Promise<Object>} - The response object
 */
exports.handler = async (event, context) => {
    try {
        logger.info('Lambda function invoked', { 
            requestId: context.awsRequestId,
            functionName: context.functionName,
            functionVersion: context.functionVersion,
            memoryLimitInMB: context.memoryLimitInMB
        });
        
        // Process the request
        const response = await processRequest(event);
        
        logger.info('Lambda function completed successfully', { 
            statusCode: response.statusCode
        });
        
        return response;
    } catch (error) {
        logger.error('Unhandled error in Lambda function', { 
            error: error.message,
            stack: error.stack
        });
        
        // Return a generic error response
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: 'An unexpected error occurred'
            })
        };
    }
};