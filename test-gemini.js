
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API KEY");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    // The SDK doesn't have a direct 'listModels' in the same way the REST API does easily without auth setup, 
    // but let's try a simple generation with a known safe model to verify auth and existence.
    // Actually, I'll just try to hit the API with a curl to see valid models if I can, 
    // but for now I will switch to 'gemini-1.5-flash' which is the current recommended standard alias.
    console.log("Skipping list, switching to gemini-1.5-flash");
  } catch (e) {
    console.error(e);
  }
}

listModels();
