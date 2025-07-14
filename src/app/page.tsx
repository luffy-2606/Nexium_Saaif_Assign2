'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { generateSummary } from '@/lib/summarizer'
import { translateToUrdu } from '@/lib/translator'

export default function BlogSummarizer() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [blogData, setBlogData] = useState<{
    title: string
    content: string
    summary: string
    urduSummary: string
  } | null>(null)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState('')

  const handleSummarize = async () => {
    if (!url) {
      setError('Please enter a blog URL')
      return
    }

    setIsLoading(true)
    setError('')
    setSaveStatus('')

    try {
      // Step 1: Scrape the blog
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!scrapeResponse.ok) {
        throw new Error('Failed to scrape blog')
      }

      const scrapeData = await scrapeResponse.json()
      
      // Step 2: Generate summary using our simple AI logic
      const summary = generateSummary(scrapeData.content)
      
      // Step 3: Translate to Urdu
      const urduSummary = translateToUrdu(summary)

      setBlogData({
        title: scrapeData.title,
        content: scrapeData.content,
        summary: summary,
        urduSummary: urduSummary
      })

      // Step 4: Save to databases
      const saveResponse = await fetch('/api/save-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scrapeData.title,
          url: url,
          summary: summary,
          urdu_summary: urduSummary,
          full_text: scrapeData.fullText
        })
      })

      const saveResult = await saveResponse.json()
      
      if (saveResult.success) {
        setSaveStatus(`✅ Data saved! Supabase: ${saveResult.supabase_saved ? '✅' : '❌'}, MongoDB: ${saveResult.mongodb_saved ? '✅' : '❌'}`)
      } else {
        setSaveStatus('⚠️ Summary generated but database save failed')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Blog Summarizer</h1>
          <p className="text-muted-foreground">
            Enter a blog URL to get an AI summary and Urdu translation
          </p>
        </div>

        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">Blog URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/blog-post"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSummarize} 
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? 'Processing...' : 'Summarize'}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Save Status */}
          {saveStatus && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 text-sm">{saveStatus}</p>
            </div>
          )}

          {/* Results */}
          {blogData && (
            <div className="space-y-6">
              {/* Blog Title */}
              <div className="space-y-2">
                <Label>Blog Title</Label>
                <div className="bg-muted p-4 rounded-md">
                  <h2 className="text-xl font-semibold">{blogData.title}</h2>
                </div>
              </div>

              {/* Original Content Preview */}
              <div className="space-y-2">
                <Label>Original Content (Preview)</Label>
                <Textarea
                  value={blogData.content.substring(0, 500) + '...'}
                  readOnly
                  className="min-h-[100px]"
                />
              </div>

              {/* English Summary */}
              <div className="space-y-2">
                <Label>AI Summary (English)</Label>
                <Textarea
                  value={blogData.summary}
                  readOnly
                  className="min-h-[120px]"
                />
              </div>

              {/* Urdu Translation */}
              <div className="space-y-2">
                <Label>Urdu Translation</Label>
                <Textarea
                  value={blogData.urduSummary}
                  readOnly
                  className="min-h-[120px] font-mono"
                  dir="rtl"
                />
              </div>

              {/* New Summarize Button */}
              <div className="text-center">
                <Button 
                  onClick={() => {
                    setBlogData(null)
                    setUrl('')
                    setSaveStatus('')
                  }}
                  variant="outline"
                >
                  Summarize Another Blog
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Simple Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, ShadCN UI, Supabase & MongoDB</p>
        </footer>
      </div>
    </div>
  )
}
