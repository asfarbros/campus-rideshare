const { GoogleGenerativeAI } = require("@google/generative-ai");
const { toolDeclarations, toolExecutors } = require("../utils/geminiTools");

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

        const systemInstruction = `You are the official AI assistant for Campus RideShare, an exclusive carpooling app for SSN College students. You are helpful, concise, and friendly. Help students find rides, understand hosteller plans, navigate pickup locations, and answer policy questions. 
CRITICAL RULE: When users ask about "pickup locations", "boarding points", or the "route", this strictly refers to the 'routeAreas' array in the activeRides data (which you can fetch using fetch_live_rides tool). You MUST ONLY list the exact locations provided in the 'routeAreas' array for a given ride. You MUST NEVER make up, suggest, or hallucinate outside locations that are not explicitly in the 'routeAreas' array.
You have access to tools to fetch live ride data and search policy documents. Use them when necessary to answer user queries.`;

        // Using gemini-3.5-flash for stable function calling support
        const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction,
            tools: [{ functionDeclarations: toolDeclarations }]
        });

        // Format history for Gemini API
        const formattedHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory
        });

        const sendWithTimeout = async (payload) => {
            let timer;
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    timer = setTimeout(() => reject(new Error("AI_SERVICE_TIMEOUT")), 30000);
                });
                const aiPromise = chat.sendMessage(payload);
                aiPromise.catch(err => console.error("Background AI Error (ignored):", err.message));
                return await Promise.race([aiPromise, timeoutPromise]);
            } finally {
                if (timer) clearTimeout(timer);
            }
        };

        try {
            console.log("2. Sending user message to Gemini API...");
            let result = await sendWithTimeout(message);
            
            // Check if model decided to call a function
            let functionCalls = result.response.functionCalls();
            
            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0]; // Process the first tool call
                console.log("3. Model decided to call a function:", call.name);
                
                const executor = toolExecutors[call.name];
                if (executor) {
                    // Execute the corresponding local function
                    const functionResult = await executor(call.args);
                    
                    console.log("4. Sending function result back to model.");
                    
                    result = await sendWithTimeout(`[Tool execution result for function ${call.name}]: ${JSON.stringify(functionResult)}`);
                } else {
                    console.warn(`Tool ${call.name} not found in executors!`);
                }
            } else {
                console.log("3. Model responded directly without calling tools.");
            }

            let responseText = "";
            try {
                if (result.response.candidates && result.response.candidates[0] && result.response.candidates[0].content && result.response.candidates[0].content.parts) {
                    responseText = result.response.candidates[0].content.parts
                        .filter(p => p.text)
                        .map(p => p.text)
                        .join("\n");
                }
                if (!responseText || !responseText.trim()) {
                    responseText = result.response.text();
                }
            } catch (e) {
                console.error("Error extracting text from response:", e.message);
            }

            if (!responseText || !responseText.trim()) {
                responseText = "I checked our system, but couldn't find any specific rides. Could you please specify the exact date (in YYYY-MM-DD format) you're looking for?";
            }

            return res.json({ response: responseText });

        } catch (apiError) {
            console.error("Gemini AI API Error:", apiError);
            if (apiError.message === "AI_SERVICE_TIMEOUT") {
                return res.status(504).json({ error: "AI Service timeout" });
            }
            return res.status(503).json({ 
                error: "Chat service is temporarily unavailable. Please try again later." 
            });
        }
        
    } catch (error) {
        console.error("X. Error occurred in chatController:", error);
        return res.status(500).json({ error: "Failed to process chat message.", details: error.message });
    }
};