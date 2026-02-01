// Serverless function for food analysis using OpenAI Vision API

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

  // Debug logging
  console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
  console.log('Request body:', req.body ? 'Present' : 'Missing');

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        details: 'Please set OPENAI_API_KEY environment variable in Vercel dashboard' 
      });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Import OpenAI here to avoid issues with module loading
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Making OpenAI API call...');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and provide a JSON response with:
              {
                "foodName": "name of the food",
                "isSafe": true or false,
                "explanation": "detailed explanation",
                "warnings": ["any warnings as array"]
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

    console.log('OpenAI response received');

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
      details: error.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}