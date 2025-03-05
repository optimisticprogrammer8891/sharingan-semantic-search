/**
 * Tests for the semantic search handler
 */
const { processRequest } = require('../../src/handlers/semanticSearch');
const openaiService = require('../../src/services/openai');
const pineconeService = require('../../src/services/pinecone');

// Mock the services
jest.mock('../../src/services/openai');
jest.mock('../../src/services/pinecone');
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
}));

describe('Semantic Search Handler', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Mock the initialize function
        pineconeService.initialize.mockResolvedValue();
        
        // Mock the generateEmbeddings function
        openaiService.generateEmbeddings.mockResolvedValue([0.1, 0.2, 0.3]);
        
        // Mock the queryIndex function
        pineconeService.queryIndex.mockResolvedValue([
            {
                id: 'doc1',
                score: 0.9,
                metadata: {
                    text: 'Sample text from document 1'
                }
            },
            {
                id: 'doc2',
                score: 0.8,
                metadata: {
                    text: 'Sample text from document 2'
                }
            }
        ]);
        
        // Mock the generateCompletion function
        openaiService.generateCompletion.mockResolvedValue({
            role: 'assistant',
            content: 'This is a sample response'
        });
    });
    
    test('should process a valid request successfully', async () => {
        // Create a mock event
        const event = {
            body: JSON.stringify({
                prompt: 'Test prompt',
                instructions: 'Test instructions',
                courseID: 'TEST-COURSE-123'
            })
        };
        
        // Call the handler
        const response = await processRequest(event);
        
        // Check the response
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).response).toEqual({
            role: 'assistant',
            content: 'This is a sample response'
        });
        
        // Verify that the services were called with the correct parameters
        expect(pineconeService.initialize).toHaveBeenCalled();
        expect(openaiService.generateEmbeddings).toHaveBeenCalledWith('Test prompt');
        expect(pineconeService.queryIndex).toHaveBeenCalledWith([0.1, 0.2, 0.3], 'TEST-COURSE-123');
        expect(openaiService.generateCompletion).toHaveBeenCalledWith(
            'Sample text from document 1 Sample text from document 2 ',
            'Test instructions'
        );
    });
    
    test('should return an error for missing prompt', async () => {
        // Create a mock event with missing prompt
        const event = {
            body: JSON.stringify({
                instructions: 'Test instructions',
                courseID: 'TEST-COURSE-123'
            })
        };
        
        // Call the handler
        const response = await processRequest(event);
        
        // Check the response
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error).toBe('Prompt is required');
        
        // Verify that the services were not called
        expect(openaiService.generateEmbeddings).not.toHaveBeenCalled();
        expect(pineconeService.queryIndex).not.toHaveBeenCalled();
        expect(openaiService.generateCompletion).not.toHaveBeenCalled();
    });
    
    test('should return an error for missing instructions', async () => {
        // Create a mock event with missing instructions
        const event = {
            body: JSON.stringify({
                prompt: 'Test prompt',
                courseID: 'TEST-COURSE-123'
            })
        };
        
        // Call the handler
        const response = await processRequest(event);
        
        // Check the response
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error).toBe('Instructions are required');
        
        // Verify that the services were not called
        expect(openaiService.generateEmbeddings).not.toHaveBeenCalled();
        expect(pineconeService.queryIndex).not.toHaveBeenCalled();
        expect(openaiService.generateCompletion).not.toHaveBeenCalled();
    });
    
    test('should handle service errors gracefully', async () => {
        // Create a mock event
        const event = {
            body: JSON.stringify({
                prompt: 'Test prompt',
                instructions: 'Test instructions',
                courseID: 'TEST-COURSE-123'
            })
        };
        
        // Mock a service error
        openaiService.generateEmbeddings.mockRejectedValue(new Error('API Error'));
        
        // Call the handler
        const response = await processRequest(event);
        
        // Check the response
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error).toBe('API Error');
        
        // Verify that the services were called correctly
        expect(pineconeService.initialize).toHaveBeenCalled();
        expect(openaiService.generateEmbeddings).toHaveBeenCalledWith('Test prompt');
        expect(pineconeService.queryIndex).not.toHaveBeenCalled();
        expect(openaiService.generateCompletion).not.toHaveBeenCalled();
    });
});