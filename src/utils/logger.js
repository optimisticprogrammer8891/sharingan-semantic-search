/**
 * Logger utility module
 * Provides consistent logging throughout the application
 */

// Simple logger implementation
// In a production environment, this could be replaced with a more robust solution like Winston
const logger = {
    /**
     * Log an info message
     * @param {string} message - The message to log
     * @param {Object} [data] - Additional data to log
     */
    info: (message, data = {}) => {
        console.log(JSON.stringify({
            level: 'INFO',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    },

    /**
     * Log a warning message
     * @param {string} message - The message to log
     * @param {Object} [data] - Additional data to log
     */
    warn: (message, data = {}) => {
        console.log(JSON.stringify({
            level: 'WARN',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    },

    /**
     * Log an error message
     * @param {string} message - The message to log
     * @param {Object} [data] - Additional data to log
     */
    error: (message, data = {}) => {
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            message,
            ...data
        }));
    },

    /**
     * Log a debug message
     * @param {string} message - The message to log
     * @param {Object} [data] - Additional data to log
     */
    debug: (message, data = {}) => {
        if (process.env.DEBUG === 'true') {
            console.log(JSON.stringify({
                level: 'DEBUG',
                timestamp: new Date().toISOString(),
                message,
                ...data
            }));
        }
    }
};

module.exports = logger;