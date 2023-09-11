const { Configuration, OpenAIApi } = require("openai");
const { PineconeClient } = require('@pinecone-database/pinecone');

const openai_api_key = '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'; // Use environment variable
const pinecone_api_key = '6195225e-f7dc-4fc8-922e-b4fc29889594'; // Use environment variable

const configuration = new Configuration({
    apiKey: openai_api_key,
});
const pinecone = new PineconeClient();
const openai = new OpenAIApi(configuration);

const query_pinecone = async (embeddings, courseID) => {
    console.log("inside query_pinecone, timestamp:", new Date().getTime());
    const index = pinecone.Index('mera-master-db');
    console.log("inside query_pinecone, index:", index);
    const result = await index.query({
        queryRequest: {
            topK: 5,
            includeMetadata: true,
            vector: embeddings,
            filter:{"course": "CS-EET-2022S-P1-BusinessCommunication"}
        },
    });
    console.log("inside query_pinecone, result:", result);
    console.log("inside query_pinecone after query, timestamp:", new Date().getTime());
    return result.matches; // Assuming matches contain the required data
};


const call_openai = async (metadata_concatenated, instructions) => {
    console.log("inside call_openai, timestamp:", new Date().getTime());
    const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "user", content: metadata_concatenated },
            { role: "system", content: instructions }
        ],
    });
    console.log("inside call_openai, after generating result, timestamp:", new Date().getTime());
    return chatCompletion.data.choices[0].message;
};

async function generate_embeddings(prompt) {
    // Generate vector embeddings using OpenAI Ada model
    console.log("inside generate_embeddings, prompt:", prompt);
    console.log("inside generate_embeddings, timestamp:", new Date().getTime());

    const response = await openai.createEmbedding({
        'input': prompt['0'],
        'model': "text-embedding-ada-002",
        'document': {
            'text': ''
        }
    });
    console.log("inside generate_embeddings, response:", response);
    console.log("inside generate_embeddings, after generating embeddings, timestamp:", new Date().getTime());
    const embeddings = response.data.data[0].embedding;
    console.log("inside generate_embeddings, embeddings:", embeddings);
    return embeddings;
}

exports.handler = async (event, context) => {
    pinecone.init({
    apiKey: pinecone_api_key,
    environment: 'us-west4-gcp-free',
    });
    // Assuming the Lambda function is triggered with a POST request
    // return await lambda_handler(event, context);
    console.log("event.body:", event.body);
    
    const { prompt, instructions, courseID } = JSON.parse(event.body);

    console.log("prompt:", prompt);
    console.log("instructions:", instructions);
    console.log("courseID:", courseID);

    // Generate vector embeddings using OpenAI Ada model (You'll need to implement this part)
    const embeddings = await generate_embeddings(prompt);

    // Query Pinecone
    const query_results = await query_pinecone(embeddings, courseID);
    // Concatenate the metadata
    let metadata_concatenated = "";
    query_results.forEach(match => {
        // Assuming match.metadata contains a 'text' property
        metadata_concatenated += match.metadata.text + " ";
    });
    
    // Call OpenAI
    const openai_response = await call_openai(metadata_concatenated, instructions);

    console.log(openai_response);
    // Prepare the response
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            response: openai_response
        })
    };

    console.log(response);
    return openai_response;
    // context.send(response)
};

// Rest of the code remains the same
