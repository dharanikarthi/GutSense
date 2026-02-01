# Deployment Guide

## Quick Deploy to Vercel

1. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with sk-...)

2. **Deploy via Vercel Dashboard** (Recommended):
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository: https://github.com/dharanikarthi/GutSense.git
   - In deployment settings, add environment variable:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key
   - Deploy

3. **Alternative: Deploy via CLI**:
```bash
npm i -g vercel
vercel
```
Then set the environment variable in Vercel dashboard.

## Environment Variables Required

- `OPENAI_API_KEY`: Your OpenAI API key (required for food analysis)

## Testing Locally

1. Create `.env.local` file in project root:
```
OPENAI_API_KEY=your_key_here
```

2. Run the development server:
```bash
npm install
npm start
```

The app will be available at http://localhost:3000

## Troubleshooting

- **500 Error**: Check if OPENAI_API_KEY is set in Vercel environment variables
- **API Quota**: Ensure your OpenAI account has sufficient credits
- **Invalid API Key**: Verify your OpenAI API key is correct and active