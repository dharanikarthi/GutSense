import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        details: 'Please set OPENAI_API_KEY environment variable' 
      });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and provide:
              1. Identify what food this is
              2. Determine if it's safe to eat (consider freshness, mold, spoilage, etc.)
              3. Provide explanation for your assessment
              4. List any warnings or concerns
              
              Respond in JSON format:
              {
                "foodName": "name of the food",
                "isSafe": true/false,
                "explanation": "detailed explanation of your assessment",
                "warnings": ["warning1", "warning2"]
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    
    // Try to parse JSON response
    let analysis;
    try {
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      analysis = JSON.parse(jsonString);
      
      // Ensure required fields exist
      if (!analysis.foodName) analysis.foodName = "Unknown food item";
      if (typeof analysis.isSafe !== 'boolean') analysis.isSafe = false;
      if (!analysis.explanation) analysis.explanation = "Unable to analyze the image properly.";
      if (!Array.isArray(analysis.warnings)) analysis.warnings = [];
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // If JSON parsing fails, create a structured response
      analysis = {
        foodName: "Unknown food item",
        isSafe: false,
        explanation: content || "Unable to analyze the image. Please try again with a clearer image.",
        warnings: ["Unable to properly analyze the image. Please try again with a clearer image."]
      };
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing food:', error);
    
    // More specific error handling
    if (error.code === 'insufficient_quota') {
      return res.status(500).json({ 
        error: 'OpenAI API quota exceeded',
        details: 'Please check your OpenAI account billing and usage limits' 
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({ 
        error: 'Invalid OpenAI API key',
        details: 'Please check your OPENAI_API_KEY environment variable' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to analyze food image',
      details: error.message || 'Unknown error occurred'
    });
  }
}