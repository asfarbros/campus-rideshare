const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const Ride = require("../models/Ride");
const RideRequest = require("../models/RideRequest");
const TravelPost = require("../models/TravelPost");
const PolicyDocument = require("../models/PolicyDocument");

// The tool declarations for Gemini
const toolDeclarations = [
    {
        name: "fetch_live_rides",
        description: "Fetch live rides, pending requests, and travel posts for a specific date.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                date: {
                    type: SchemaType.STRING,
                    description: "The date to fetch rides for in YYYY-MM-DD format. E.g. 2026-08-21"
                }
            },
            required: ["date"]
        }
    },
    {
        name: "search_policies",
        description: "Search the policy documents for rules, guidelines, cancellations, payments, or safety information.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                query: {
                    type: SchemaType.STRING,
                    description: "The search query to look up in the policy documents."
                }
            },
            required: ["query"]
        }
    }
];

// Helper functions for execution

async function fetchLiveRides({ date }) {
    console.log(`[Tool Executing] fetchLiveRides for date: ${date}`);
    try {
        const [activeRides, pendingRequests, recentTravelPosts] = await Promise.all([
            Ride.find({ date: { $gte: date } }).select("from to date time vehicleType seatsAvailable routeAreas").limit(15).lean(),
            RideRequest.find({ status: "pending" }).countDocuments(),
            TravelPost.find({ travelDate: { $gte: date } }).select("destination travelDate note").limit(15).lean(),
        ]);

        return {
            activeRides: activeRides.map(r => ({
                from: r.from,
                to: r.to,
                date: r.date,
                time: r.time,
                type: r.vehicleType,
                seats: r.seatsAvailable,
                routeAreas: r.routeAreas
            })),
            pendingRequestsCount: pendingRequests,
            recentTravelPosts: recentTravelPosts.map(p => ({ to: p.destination, date: p.travelDate, text: p.note }))
        };
    } catch (error) {
        console.error("Error in fetchLiveRides tool:", error);
        return { error: "Failed to fetch live rides from database." };
    }
}

async function performVectorSearch({ query }) {
    console.log(`[Tool Executing] performVectorSearch for query: ${query}`);
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await embeddingModel.embedContent(query);
        const queryEmbedding = result.embedding.values;

        // Perform vector search
        const searchResults = await PolicyDocument.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index", // Must match the index name in Atlas
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 10,
                    limit: 3
                }
            },
            {
                $project: {
                    _id: 0,
                    textChunk: 1,
                    source: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]);

        return {
            results: searchResults.map(doc => ({
                source: doc.source,
                text: doc.textChunk
            }))
        };

    } catch (error) {
        console.error("Error in performVectorSearch tool:", error);
        return { error: "Failed to search policy documents." };
    }
}

// Main executor mapping
const toolExecutors = {
    fetch_live_rides: fetchLiveRides,
    search_policies: performVectorSearch
};

module.exports = {
    toolDeclarations,
    toolExecutors
};
