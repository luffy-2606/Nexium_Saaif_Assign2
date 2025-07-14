import { NextResponse } from 'next/server';
import { supabase, connectToMongoDB } from '@/lib/database';

export async function GET() {
  const results = {
    supabase: false,
    mongodb: false,
    errors: [] as string[]
  };

  // Test Supabase
  try {
    const { data, error } = await supabase
      .from('blog_summaries')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      results.errors.push(`Supabase error: ${error.message}`);
    } else {
      results.supabase = true;
    }
  } catch (error) {
    results.errors.push(`Supabase connection failed: ${error}`);
  }

  // Test MongoDB
  try {
    const db = await connectToMongoDB();
    await db.collection('blog_contents').findOne({});
    results.mongodb = true;
  } catch (error) {
    results.errors.push(`MongoDB connection failed: ${error}`);
  }

  return NextResponse.json(results);
} 