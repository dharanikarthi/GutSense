# Food Analyzer

A React-based web application that uses OpenAI's vision API to identify food in images and determine if it's safe to eat.

## Features

- Upload food images
- AI-powered food identification
- Safety assessment with detailed explanations
- Responsive design with modern UI
- Deployed on Vercel

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run locally:
```bash
npm start
```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable in Vercel dashboard:
   - Go to your project settings
   - Add `OPENAI_API_KEY` with your OpenAI API key

## How it works

1. User uploads a food image
2. Image is converted to base64 and sent to the API
3. OpenAI's GPT-4 Vision analyzes the image
4. Returns food identification and safety assessment
5. Results displayed with visual indicators

## Tech Stack

- React 18
- OpenAI GPT-4 Vision API
- Vercel for deployment
- Modern CSS with gradients and animations