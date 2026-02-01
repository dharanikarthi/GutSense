export default async function handler(req, res) {
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
    console.log('Starting analyze-simple endpoint');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('No OpenAI API key found');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        details: 'Please set OPENAI_API_KEY environment variable in Vercel dashboard' 
      });
    }

    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Image received, length:', image.length);

    // For now, return a mock response to test the endpoint
    const mockResponse = {
      foodName: "Test Food Item",
      isSafe: true,
      explanation: "This is a test response. The API endpoint is working correctly.",
      warnings: []
    };

    console.log('Returning mock response');
    res.status(200).json(mockResponse);

  } catch (error) {
    console.error('Error in analyze-simple:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message
    });
  }
}