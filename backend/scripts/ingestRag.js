const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PolicyDocument = require('../models/PolicyDocument');
/*
  =============================================================
  MONGODB ATLAS VECTOR SEARCH INDEX CONFIGURATION
  =============================================================
  Before running queries against this collection, you MUST create a
  Vector Search Index in your MongoDB Atlas UI for the 'policydocuments' collection.

  1. Go to MongoDB Atlas -> Data Explorer
  2. Select your database -> 'policydocuments' collection
  3. Go to the "Atlas Search" tab and click "Create Search Index"
  4. Select "JSON Editor"
  5. Paste the following configuration:

  {
    "fields": [
      {
        "numDimensions": 3072,
        "path": "embedding",
        "similarity": "cosine",
        "type": "vector"
      }
    ]
  }

  6. Name the index 'vector_index' (or update the name in performVectorSearch)
  7. Create the index and wait for it to build.
  =============================================================
*/

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RAW_POLICY_TEXT = `
Welcome to Campus RideShare for SSN College students. 
This platform is exclusively for verified students and staff of SSN College.
All riders and drivers must treat each other with respect.
Cancellations: If you need to cancel a ride, please do so at least 2 hours in advance. Repeated last-minute cancellations may result in a temporary suspension of your account.
Payment: We encourage splitting the cost of travel evenly. Drivers may charge a nominal fee for fuel, but this platform is not intended for commercial profit.
Safety: Always verify the driver's identity before boarding. In case of an emergency, please use the SOS feature in the app.
Pick-up Locations: Drivers are required to stop only at the designated pick-up points explicitly listed in their route. No detours should be requested.
`;

async function generateEmbeddingsAndSave() {
    try {
        console.log("Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Clear existing documents to avoid duplicates during testing
        await PolicyDocument.deleteMany({});
        console.log("Cleared existing policy documents.");

        // Split text by newlines and trim whitespace
        const chunks = RAW_POLICY_TEXT.split('\n').map(c => c.trim()).filter(c => c.length > 0);
        console.log(`Found ${chunks.length} chunks to process.`);

        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        for (const chunk of chunks) {
            console.log(`Generating embedding for: "${chunk.substring(0, 30)}..."`);
            const result = await embeddingModel.embedContent(chunk);
            const embedding = result.embedding.values;

            const doc = new PolicyDocument({
                source: "Campus RideShare Guidelines",
                textChunk: chunk,
                embedding: embedding
            });

            await doc.save();
        }

        console.log("Ingestion complete!");
        process.exit(0);

    } catch (error) {
        console.error("Error during ingestion:", error);
        process.exit(1);
    }
}

generateEmbeddingsAndSave();
