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

  console.log('Starting food analysis...');

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

    console.log('Image received, initializing OpenAI...');

    // Import OpenAI dynamically
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Making OpenAI API call...');

    // Use the correct model name for vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use the mini version which is more reliable and cheaper
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a food safety expert. Analyze this food image and respond with ONLY a JSON object in this exact format:

{
  "foodName": "specific name of the food item",
  "isSafe": true,
  "explanation": "Brief explanation of your assessment including freshness, appearance, and safety factors",
  "warnings": []
}

Set isSafe to false if you see any signs of spoilage, mold, unusual discoloration, or other safety concerns. Include specific warnings in the warnings array if needed.`
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
      max_tokens: 300,
      temperature: 0.1
    });

    console.log('OpenAI response received');

    const content = response.choices[0].message.content;
    console.log('Raw response:', content);
    
    // Try to parse JSON response
    let analysis;
    try {
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      analysis = JSON.parse(jsonString);
      
      // Ensure required fields exist with proper types
      analysis.foodName = analysis.foodName || "Unknown food item";
      analysis.isSafe = typeof analysis.isSafe === 'boolean' ? analysis.isSafe : false;
      analysis.explanation = analysis.explanation || "Unable to analyze the image properly.";
      analysis.warnings = Array.isArray(analysis.warnings) ? analysis.warnings : [];
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Content that failed to parse:', content);
      
      // If JSON parsing fails, create a structured response
      analysis = {
        foodName: "Unknown food item",
        isSafe: false,
        explanation: "The AI was unable to properly analyze this image. Please try again with a clearer, well-lit photo of the food.",
        warnings: ["Image analysis failed - please try a different photo"]
      };
    }

    console.log('Final analysis:', analysis);
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

    if (error.message && error.message.includes('model')) {
      return res.status(500).json({ 
        error: 'Model not available',
        details: 'The requested AI model is not available. Please try again later.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to analyze food image',
      details: error.message || 'Unknown error occurred'
    });
  }
}