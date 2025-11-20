const { GoogleGenAI, Type } = require("@google/genai");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set on Vercel.");
      return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
        required: ["title", "description", "tags"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonText = response.text?.trim();

    if (jsonText) {
      // The AI might wrap the JSON in ```json ... ```, so clean it.
      const cleanedJsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
      const parsed = JSON.parse(cleanedJsonText);
      return res.status(200).json(parsed);
    } else {
      throw new Error("Received an empty response from the AI.");
    }

  } catch (error) {
    console.error('Error in /api/generate:', error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
};
