# Blog Summarizer

A simple Next.js app that scrapes blog posts, generates AI summaries, and translates them to Urdu.

## Features

- **Web Scraping**: Extract content from any blog URL
- **AI Summary**: Generate summaries using simple static logic
- **Urdu Translation**: Basic English-to-Urdu translation using JavaScript dictionary
- **Dual Database**: Save summaries to Supabase, full text to MongoDB
- **Modern UI**: Built with ShadCN UI components

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# MongoDB Configuration  
MONGODB_URI=mongodb://localhost:27017/blog-summarizer
```

### 3. Database Setup

#### Supabase Setup:
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Create a table called `blog_summaries` with these columns:
   - `id` (uuid, primary key)
   - `title` (text)
   - `url` (text)
   - `summary` (text)
   - `urdu_summary` (text)
   - `created_at` (timestamp)

#### MongoDB Setup:
- For local development: Install MongoDB locally
- For production: Use MongoDB Atlas or any MongoDB cloud service
- The app will automatically create the `blog_contents` collection

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## How It Works

1. **Input**: Enter any blog URL
2. **Scraping**: App extracts title and content using Cheerio
3. **Summary**: Simple AI logic identifies key sentences  
4. **Translation**: JavaScript dictionary translates to Urdu
5. **Storage**: Summary → Supabase, Full text → MongoDB

## Tech Stack

- **Framework**: Next.js 15
- **UI**: ShadCN UI + Tailwind CSS
- **Scraping**: Cheerio
- **Databases**: Supabase + MongoDB
- **Language**: TypeScript

## Deployment

The app is ready to deploy to Vercel:

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Note

This is a beginner-friendly implementation with:
- Simple static AI logic (not real AI)
- Basic dictionary-based translation
- Minimal error handling
- Demo-ready functionality

Perfect for learning and prototyping!
