# Deployment Guide

## Quick Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Deploy the app**:
```bash
vercel
```

3. **Set Environment Variables**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add: `OPENAI_API_KEY` with your OpenAI API key

## Alternative: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Set the environment variable `OPENAI_API_KEY`
5. Deploy

## Environment Variables Required

- `OPENAI_API_KEY`: Your OpenAI API key (get it from https://platform.openai.com/api-keys)

## Testing Locally

1. Create `.env` file:
```
OPENAI_API_KEY=your_key_here
```

2. Run the development server:
```bash
npm start
```

The app will be available at http://localhost:3000