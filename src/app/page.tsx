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
        const errorText = await scrapeResponse.text()
        console.error('Scrape API error:', errorText)
        throw new Error(`Failed to scrape blog: ${scrapeResponse.status}`)
      }

      const responseText = await scrapeResponse.text()
      let scrapeData;
      
      try {
        scrapeData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response was:', responseText.substring(0, 200))
        throw new Error('Invalid response from scraping service')
      }
      
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

      let saveResult;
      try {
        saveResult = await saveResponse.json()
      } catch (parseError) {
        console.error('Save API JSON Parse Error:', parseError)
        saveResult = { success: false, error: 'Invalid response from save service' }
      }
      
      if (saveResult.success) {
        setSaveStatus(`Data saved successfully! Supabase: ${saveResult.supabase_saved ? 'Succesfull' : 'Unsuccesfull'}, MongoDB: ${saveResult.mongodb_saved ? 'Succesfull' : 'Unsuccesfull'}`)
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
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-600/20 rounded-full blur-3xl float-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl float-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-teal-600/10 rounded-full blur-3xl float-animation" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 slide-up">
          
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animated-title">
            Blog Summarizer
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform any blog post into concise summaries with automatic Urdu translation. 
            <span className="text-primary font-semibold"> Fast, Accurate, and Beautiful.</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* URL Input Section */}
          <div className="glass rounded-2xl p-8 slide-up stagger-1">
            <div className="space-y-6">
              <Label htmlFor="url" className="text-lg font-semibold">Enter Blog URL</Label>
              
              <div className="flex gap-4">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 text-lg border-2 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSummarize} 
                  disabled={isLoading || !url.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      Processing
                    </div>
                  ) : (
                    'Summarize'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="glass rounded-2xl p-6 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 slide-up">
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}

          {/* Save Status */}
          {saveStatus && (
            <div className="glass rounded-2xl p-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20 slide-up">
              <p className="text-green-800 dark:text-green-200 font-medium">{saveStatus}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="glass rounded-2xl p-8 slide-up">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">Processing your blog post...</p>
                  <p className="text-muted-foreground">Scraping content, generating summary, and translating to Urdu</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {blogData && !isLoading && (
            <div className="space-y-6">
              {/* Blog Title */}
              <div className="glass rounded-2xl p-8 slide-up stagger-2">
                <Label className="text-lg font-semibold mb-6 block">Blog Title</Label>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border-2 border-teal-100 dark:border-teal-800">
                  <h2 className="text-2xl font-bold text-primary">{blogData.title}</h2>
                </div>
              </div>

              

              {/* English Summary */}
              <div className="glass rounded-2xl p-8 slide-up stagger-4">
                <Label className="text-lg font-semibold mb-6 block">AI Summary (English)</Label>
                <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 p-6 rounded-xl border-2 border-cyan-100 dark:border-cyan-800">
                  <p className="text-lg leading-relaxed text-cyan-900 dark:text-cyan-100">{blogData.summary}</p>
                </div>
              </div>

              {/* Urdu Translation */}
              <div className="glass rounded-2xl p-8 slide-up stagger-4">
                <Label className="text-lg font-semibold mb-6 block">Urdu Translation</Label>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-xl border-2 border-emerald-100 dark:border-emerald-800">
                  <p className="text-lg leading-relaxed text-emerald-900 dark:text-emerald-100 font-mono" dir="rtl">
                    {blogData.urduSummary}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-8">
                <Button 
                  onClick={() => {
                    setBlogData(null)
                    setUrl('')
                    setSaveStatus('')
                    setError('')
                  }}
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transform hover:scale-[1.02] transition-all duration-300"
                >
                  Summarize Another Blog
                </Button>
                
                
              </div>
            </div>
          )}
        </div>

        
      </div>
    </div>
  )
}
