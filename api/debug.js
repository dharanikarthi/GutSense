export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test OpenAI import
    const { OpenAI } = await import('openai');
    
    const debugInfo = {
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'none',
      method: req.method,
      environment: process.env.NODE_ENV || 'unknown',
      openaiImported: !!OpenAI
    };

    // Test OpenAI initialization if key exists
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        debugInfo.openaiInitialized = true;
      } catch (initError) {
        debugInfo.openaiInitialized = false;
        debugInfo.initError = initError.message;
      }
    }

    res.status(200).json(debugInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Debug endpoint failed',
      details: error.message,
      stack: error.stack
    });
  }
}