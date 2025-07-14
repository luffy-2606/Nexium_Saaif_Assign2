import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the webpage with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
      '.article-content',
      '.story-content',
      '.post-body'
    ];
    
    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text.length > content.length && text.length > 100) {
        content = text;
      }
    }
    
    // If still no content, get all paragraph text
    if (!content || content.length < 100) {
      const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
      content = paragraphs.filter(p => p.length > 20).join(' ');
    }
    
    // Final fallback - get all text content
    if (!content || content.length < 50) {
      content = $('body').text().trim();
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