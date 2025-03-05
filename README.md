# Sharingan Semantic Search

A robust back-end integration layer for Ed-Tech generative AI solutions, specifically designed for AWS Lambda functions. This service provides semantic search capabilities using OpenAI embeddings and Pinecone vector database.

## Project Structure

The project follows a modular architecture for better maintainability and scalability:

```
sharingan-semantic-search/
├── src/
│   ├── config/           # Configuration management
│   ├── handlers/         # Lambda function handlers
│   ├── services/         # Service modules for external APIs
│   └── utils/            # Utility functions and helpers
├── .env.example          # Example environment variables
├── index.js              # Main Lambda entry point
├── local.js              # Local development server
├── package.json          # Project dependencies and scripts
├── serverless.yml        # Serverless Framework configuration
└── README.md             # Project documentation
```

## Features

- Semantic search using OpenAI embeddings
- Vector similarity search with Pinecone
- Structured error handling
- Comprehensive logging
- Environment-based configuration
- Local development server
- Serverless deployment configuration

## Prerequisites

- Node.js 14.x or later
- AWS account (for deployment)
- OpenAI API key
- Pinecone API key and index

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file and update with your API keys:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file with your actual API keys and configuration

## Configuration

Configure the application by setting the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| OPENAI_API_KEY | Your OpenAI API key | (Required) |
| OPENAI_MODEL | OpenAI model to use for completions | gpt-3.5-turbo |
| OPENAI_EMBEDDING_MODEL | OpenAI model to use for embeddings | text-embedding-ada-002 |
| PINECONE_API_KEY | Your Pinecone API key | (Required) |
| PINECONE_ENVIRONMENT | Pinecone environment | us-west4-gcp-free |
| PINECONE_INDEX_NAME | Pinecone index name | mera-master-db |
| TOP_K | Number of results to return from Pinecone | 5 |
| DEBUG | Enable debug logging | false |

## Local Development

Start the local development server:

```
npm run start:local
```

The server will be available at http://localhost:3000. Send POST requests to `/api/semantic-search` with the following JSON body:

```json
{
  "prompt": "Your search query here",
  "instructions": "Instructions for the AI model",
  "courseID": "Optional course ID for filtering"
}
```

## Deployment

Deploy to AWS using the Serverless Framework:

```
npm run deploy
```

You can specify a stage and region:

```
npm run deploy -- --stage prod --region us-west-2
```

## API Reference

### POST /api/semantic-search

Performs a semantic search and returns AI-generated results.

**Request Body:**

```json
{
  "prompt": "Your search query here",
  "instructions": "Instructions for the AI model",
  "courseID": "Optional course ID for filtering"
}
```

**Response:**

```json
{
  "response": {
    "role": "assistant",
    "content": "AI-generated response based on the search results"
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400: Bad Request - Missing required parameters
- 500: Internal Server Error - Server-side errors

## License

ISC