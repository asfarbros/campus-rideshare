require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash",
        });

        const result = await model.generateContent("Hello");

        console.log(result.response.text());
    } catch (err) {
        console.error(err);
    }
}

run();