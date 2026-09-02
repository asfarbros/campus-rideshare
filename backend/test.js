require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        const result = await model.generateContent("Test connection");
        console.log("Gemini API connection OK:", result.response.text());
    } catch (err) {
        console.error("Gemini API connection test failed:", err.message);
    }
}

run();