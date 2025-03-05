/**
 * OpenAI service module
 * Handles all interactions with the OpenAI API
 */
const { Configuration, OpenAIApi } = require("openai");
const { config } = require('../config');
const logger = require('../utils/logger');

// Initialize OpenAI client
const configuration = new Configuration({
    apiKey: config.openai.apiKey,
});
const openai = new OpenAIApi(configuration);

/**
 * Generate vector embeddings for a given text
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<Array<number>>} - The generated embeddings
 */
const generateEmbeddings = async (text) => {
    try {
        logger.info('Generating embeddings', { text: text.substring(0, 50) + '...' });
        const startTime = new Date().getTime();
        
        const response = await openai.createEmbedding({
            'input': text,
            'model': config.openai.embeddingModel
        });
        
        const embeddings = response.data.data[0].embedding;
        const endTime = new Date().getTime();
        
        logger.info('Embeddings generated', { 
            duration: endTime - startTime,
            embeddingLength: embeddings.length
        });
        
        return embeddings;
    } catch (error) {
        logger.error('Error generating embeddings', { error: error.message });
        throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
};

/**
 * Call OpenAI to generate a response based on context and instructions
 * @param {string} context - The context to use for the completion
 * @param {string} instructions - The instructions for the model
 * @returns {Promise<Object>} - The OpenAI response
 */
const generateCompletion = async (context, instructions) => {
    try {
        logger.info('Generating completion', { 
            contextLength: context.length,
            instructionsLength: instructions.length
        });
        const startTime = new Date().getTime();
        
        const chatCompletion = await openai.createChatCompletion({
            model: config.openai.model,
            messages: [
                { role: "user", content: context },
                { role: "system", content: instructions }
            ],
        });
        
        const endTime = new Date().getTime();
        logger.info('Completion generated', { 
            duration: endTime - startTime,
            responseLength: chatCompletion.data.choices[0].message.content.length
        });
        
        return chatCompletion.data.choices[0].message;
    } catch (error) {
        logger.error('Error generating completion', { error: error.message });
        throw new Error(`Failed to generate completion: ${error.message}`);
    }
};

module.exports = {
    generateEmbeddings,
    generateCompletion
};