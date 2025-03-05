/**
 * Pinecone service module
 * Handles all interactions with the Pinecone API
 */
const { PineconeClient } = require('@pinecone-database/pinecone');
const { config } = require('../config');
const logger = require('../utils/logger');

// Initialize Pinecone client
const pinecone = new PineconeClient();

/**
 * Initialize the Pinecone client
 * @returns {Promise<void>}
 */
const initialize = async () => {
    try {
        logger.info('Initializing Pinecone client');
        await pinecone.init({
            apiKey: config.pinecone.apiKey,
            environment: config.pinecone.environment,
        });
        logger.info('Pinecone client initialized');
    } catch (error) {
        logger.error('Error initializing Pinecone client', { error: error.message });
        throw new Error(`Failed to initialize Pinecone: ${error.message}`);
    }
};

/**
 * Query Pinecone index with vector embeddings
 * @param {Array<number>} embeddings - The vector embeddings to query with
 * @param {string} courseID - The course ID to filter results by
 * @returns {Promise<Array<Object>>} - The query results
 */
const queryIndex = async (embeddings, courseID) => {
    try {
        logger.info('Querying Pinecone index', { courseID });
        const startTime = new Date().getTime();
        
        const index = pinecone.Index(config.pinecone.indexName);
        
        const queryRequest = {
            topK: config.app.topK,
            includeMetadata: true,
            vector: embeddings,
        };
        
        // Add filter if courseID is provided
        if (courseID) {
            queryRequest.filter = { "course": courseID };
        }
        
        const result = await index.query({ queryRequest });
        
        const endTime = new Date().getTime();
        logger.info('Pinecone query completed', { 
            duration: endTime - startTime,
            matchCount: result.matches.length
        });
        
        return result.matches;
    } catch (error) {
        logger.error('Error querying Pinecone index', { error: error.message });
        throw new Error(`Failed to query Pinecone: ${error.message}`);
    }
};

module.exports = {
    initialize,
    queryIndex
};