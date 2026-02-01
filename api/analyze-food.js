import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
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
                "warnings": ["warning1", "warning2"] // array of strings, empty if no warnings
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
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    
    // Try to parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      analysis = {
        foodName: "Unknown food item",
        isSafe: false,
        explanation: content,
        warnings: ["Unable to properly analyze the image. Please try again with a clearer image."]
      };
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing food:', error);
    res.status(500).json({ 
      error: 'Failed to analyze food image',
      details: error.message 
    });
  }
}