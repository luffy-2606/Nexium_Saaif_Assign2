import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the webpage
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    
    // Simple extraction - look for common blog content containers
    let content = '';
    
    // Try different selectors to find the main content
    const selectors = [
      'article',
      '.post-content',
      '.entry-content', 
      '.content',
      'main',
      '.blog-post',
      'p'
    ];
    
    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text.length > content.length) {
        content = text;
      }
    }
    
    // If still no content, get all paragraph text
    if (!content) {
      content = $('p').map((i, el) => $(el).text()).get().join(' ');
    }
    
    // Clean up the content
    content = content.replace(/\s+/g, ' ').trim();
    
    // Get title
    let title = $('title').text() || $('h1').first().text() || 'Untitled';
    
    return NextResponse.json({
      title: title.trim(),
      content: content.substring(0, 5000), // Limit content length
      fullText: content
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 });
  }
} 