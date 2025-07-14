import { createClient } from '@supabase/supabase-js'
import { MongoClient } from 'mongodb'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// MongoDB configuration
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-summarizer'
let client: MongoClient

export async function connectToMongoDB() {
  try {
    if (!client) {
      client = new MongoClient(mongoUri)
      await client.connect()
    }
    return client.db('blog-summarizer')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Types for our data
export interface BlogSummary {
  id?: string
  title: string
  url: string
  summary: string
  urdu_summary: string
  created_at?: string
}

export interface BlogContent {
  _id?: string
  title: string
  url: string
  full_text: string
  created_at?: Date
} 