const { GoogleGenerativeAI } = require("@google/generative-ai");
const Ride = require("../models/Ride");
const RideRequest = require("../models/RideRequest");
const TravelPost = require("../models/TravelPost");
const Location = require("../models/Location");

exports.handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        console.log("1. Chat route triggered. Message:", message);
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is missing from environment variables." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Getting today's date in YYYY-MM-DD for string comparison
        const todayStr = new Date().toISOString().split("T")[0];

        console.log("2. Querying MongoDB for rides...");
        // Fetch live context using Promise.all but apply limits and selection rules
        const [activeRides, pendingRequests, recentTravelPosts] = await Promise.all([
            Ride.find({ date: { $gte: todayStr } }).select("from to date time vehicleType seatsAvailable routeAreas").limit(15).lean(),
            RideRequest.find({ status: "pending" }).countDocuments(), // count instead of fetching all docs
            TravelPost.find({ travelDate: { $gte: todayStr } }).select("destination travelDate note").limit(15).lean(),
        ]);
        console.log("3. DB query successful. Calling Gemini API...");

        const dbContext = {
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
            recentTravelPosts: recentTravelPosts.map(p => ({ to: p.destination, date: p.travelDate, text: p.note })),
            systemMessage: "Do not hallucinate rides. Only use the ones provided above."
        };

        const stringifiedContext = JSON.stringify(dbContext);

        const systemInstruction = `You are the official AI assistant for Campus RideShare, an exclusive carpooling app for SSN College students. You are helpful, concise, and friendly. Help students find rides, understand hosteller plans, and navigate pickup locations. 
Here is the live, real-time database context of current app activity: ${stringifiedContext}. 
Use this data to answer user questions accurately. Keep answers relatively short.
CRITICAL RULE: When users ask about "pickup locations", "boarding points", or the "route", this strictly refers to the 'routeAreas' array in the activeRides data. You MUST ONLY list the exact locations provided in the 'routeAreas' array for a given ride. You MUST NEVER make up, suggest, or hallucinate outside locations that are not explicitly in the 'routeAreas' array.`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.6-flash",
            systemInstruction
        });

        // Format history for Gemini API
        // Gemini expects history in the format: { role: "user" | "model", parts: [{ text: "..." }] }
        const formattedHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory
        });

        let result;
        let timeoutId;
        try {
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error("AI_SERVICE_TIMEOUT")), 15000);
            });

            const aiPromise = chat.sendMessage(message);
            // CRITICAL FIX: If AI times out (loses the race) but rejects later, 
            // it will crash the entire Node.js server with an UnhandledPromiseRejection. 
            // We MUST attach a background catch to prevent this!
            aiPromise.catch(err => console.error("Background AI Error (ignored):", err.message));

            result = await Promise.race([
                aiPromise,
                timeoutPromise
            ]);
        } catch (apiError) {
            console.error("Gemini AI API Error:", apiError);
            if (apiError.message === "AI_SERVICE_TIMEOUT") {
                return res.status(504).json({ error: "AI Service timeout" });
            }
            return res.status(503).json({ 
                error: "Chat service is temporarily unavailable. Please try again later." 
            });
        } finally {
            clearTimeout(timeoutId);
        }
        
        const responseText = result.response.text();

        return res.json({ response: responseText });
    } catch (error) {
        console.error("X. Error occurred in chatController:", error);
        console.error("Chat API Error Details:");
        console.error("Message:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
        }
        console.error("Stack:", error.stack);
        return res.status(500).json({ error: "Failed to process chat message.", details: error.message });
    }
};