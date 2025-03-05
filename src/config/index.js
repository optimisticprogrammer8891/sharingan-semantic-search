/**
 * Configuration module for the application
 * Handles environment variables and other configuration settings
 */

// Default configuration values
const defaultConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002'
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT || 'us-west4-gcp-free',
    indexName: process.env.PINECONE_INDEX_NAME || 'mera-master-db'
  },
  app: {
    topK: parseInt(process.env.TOP_K || '5', 10)
  }
};

/**
 * Validates that all required configuration values are present
 * @throws {Error} If any required configuration is missing
 */
const validateConfig = () => {
  if (!defaultConfig.openai.apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  if (!defaultConfig.pinecone.apiKey) {
    throw new Error('PINECONE_API_KEY environment variable is required');
  }
};

module.exports = {
  config: defaultConfig,
  validateConfig
};