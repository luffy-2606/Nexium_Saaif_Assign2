import { NextRequest, NextResponse } from 'next/server';
import { supabase, connectToMongoDB, BlogSummary, BlogContent } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { title, url, summary, urdu_summary, full_text } = await request.json();
    
    if (!title || !url || !summary || !full_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save summary to Supabase
    const { data: summaryData, error: supabaseError } = await supabase
      .from('blog_summaries')
      .insert([
        {
          title,
          url,
          summary,
          urdu_summary,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      // Continue even if Supabase fails - this is for demo purposes
    }

    // Save full text to MongoDB
    try {
      const db = await connectToMongoDB();
      const collection = db.collection('blog_contents');
      
      const mongoResult = await collection.insertOne({
        title,
        url,
        full_text,
        created_at: new Date()
      });

      return NextResponse.json({
        success: true,
        supabase_saved: !supabaseError,
        mongodb_saved: !!mongoResult.insertedId,
        summary_id: summaryData?.[0]?.id,
        content_id: mongoResult.insertedId
      });
      
    } catch (mongoError) {
      console.error('MongoDB error:', mongoError);
      return NextResponse.json({
        success: true,
        supabase_saved: !supabaseError,
        mongodb_saved: false,
        summary_id: summaryData?.[0]?.id,
        error: 'MongoDB connection failed, but summary saved to Supabase'
      });
    }
    
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
} 