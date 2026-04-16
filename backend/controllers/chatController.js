const { GoogleGenerativeAI } = require("@google/generative-ai");
const Ride = require("../models/Ride");
const RideRequest = require("../models/RideRequest");
const TravelPost = require("../models/TravelPost");
const Location = require("../models/Location");

exports.handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is missing from environment variables." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Getting today's date in YYYY-MM-DD for string comparison
        const todayStr = new Date().toISOString().split("T")[0];

        // Fetch live context using Promise.all but apply limits and selection rules
        const [activeRides, pendingRequests, recentTravelPosts] = await Promise.all([
            Ride.find({ date: { $gte: todayStr } }).select("from to date time vehicleType seatsAvailable").limit(15).lean(),
            RideRequest.find({ status: "pending" }).countDocuments(), // count instead of fetching all docs
            TravelPost.find({ travelDate: { $gte: todayStr } }).select("destination travelDate note").limit(15).lean(),
        ]);

        const dbContext = {
            activeRides: activeRides.map(r => ({ from: r.from, to: r.to, date: r.date, time: r.time, type: r.vehicleType, seats: r.seatsAvailable })),
            pendingRequestsCount: pendingRequests,
            recentTravelPosts: recentTravelPosts.map(p => ({ to: p.destination, date: p.travelDate, text: p.note })),
            systemMessage: "Do not hallucinate rides. Only use the ones provided above."
        };

        const stringifiedContext = JSON.stringify(dbContext);

        const systemInstruction = `You are the official AI assistant for Campus RideShare, an exclusive carpooling app for SSN College students. You are helpful, concise, and friendly. Help students find rides, understand hosteller plans, and navigate pickup locations. Here is the live, real-time database context of current app activity: ${stringifiedContext}. Use this data to answer user questions accurately. Keep answers relatively short.`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
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

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({ response: responseText });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: "Failed to process chat message." });
    }
};