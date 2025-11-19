// Using require syntax for Node.js environment in Vercel
const { GoogleGenAI } = require("@google/genai");

// This is a Vercel Serverless Function
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // The body is already parsed by Vercel
  const { prompt, schema } = req.body;

  if (!prompt || !schema) {
    return res.status(400).json({ error: 'Missing prompt or schema in request body' });
  }

  // Securely access the API key from Vercel's environment variables
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    const jsonText = response.text?.trim();

    if (!jsonText) {
       throw new Error("Received an empty or invalid response from the AI.");
    }
    
    // The response might be wrapped in markdown ```json ... ```, so we clean it.
    const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    // Return the parsed JSON object
    res.status(200).json(JSON.parse(cleanedJsonText));

  } catch (error) {
    console.error('Error in /api/generate:', error);
    // Send a more generic error message to the client for security
    res.status(500).json({ error: 'An internal server error occurred while contacting the AI service.' });
  }
};
