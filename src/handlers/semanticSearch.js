/**
 * Semantic Search Handler
 * Main handler for the semantic search functionality
 */
const openaiService = require('../services/openai');
const pineconeService = require('../services/pinecone');
const logger = require('../utils/logger');
const { validateConfig } = require('../config');

/**
 * Process a semantic search request
 * @param {Object} event - The Lambda event object
 * @returns {Promise<Object>} - The response object
 */
const processRequest = async (event) => {
    try {
        // Validate that we have all required configuration
        validateConfig();
        
        // Initialize Pinecone client
        await pineconeService.initialize();
        
        // Parse the request body
        const body = JSON.parse(event.body || '{}');
        const { prompt, instructions, courseID } = body;
        
        // Validate request parameters
        if (!prompt) {
            throw new Error('Prompt is required');
        }
        
        if (!instructions) {
            throw new Error('Instructions are required');
        }
        
        logger.info('Processing semantic search request', { 
            promptLength: prompt.length,
            instructionsLength: instructions.length,
            courseID
        });
        
        // Generate embeddings for the prompt
        const embeddings = await openaiService.generateEmbeddings(prompt);
        
        // Query Pinecone with the embeddings
        const queryResults = await pineconeService.queryIndex(embeddings, courseID);
        
        // Concatenate the metadata from the results
        let contextText = "";
        queryResults.forEach(match => {
            if (match.metadata && match.metadata.text) {
                contextText += match.metadata.text + " ";
            }
        });
        
        // Generate a completion using the context and instructions
        const openaiResponse = await openaiService.generateCompletion(contextText, instructions);
        
        logger.info('Semantic search request processed successfully');
        
        // Return the response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                response: openaiResponse
            })
        };
    } catch (error) {
        logger.error('Error processing semantic search request', { error: error.message });
        
        // Return an error response
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};

module.exports = {
    processRequest
};