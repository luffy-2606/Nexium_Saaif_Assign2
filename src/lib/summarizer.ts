// Simple AI Summary Simulation
export function generateSummary(text: string): string {
  if (!text || text.length < 100) {
    return "Text too short to summarize.";
  }

  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length < 3) {
    return text.substring(0, 200) + "...";
  }

  // Simple scoring: prefer sentences with common important words
  const importantWords = [
    'important', 'key', 'main', 'primary', 'significant', 'crucial', 
    'essential', 'major', 'fundamental', 'critical', 'vital', 'necessary',
    'first', 'second', 'third', 'finally', 'conclusion', 'result', 'therefore',
    'because', 'however', 'although', 'despite', 'furthermore', 'moreover'
  ];

  const scoredSentences = sentences.map(sentence => {
    let score = 0;
    const words = sentence.toLowerCase().split(/\s+/);
    
    // Score based on important words
    words.forEach(word => {
      if (importantWords.includes(word)) {
        score += 2;
      }
    });
    
    // Prefer sentences of medium length
    if (words.length >= 8 && words.length <= 25) {
      score += 1;
    }
    
    // Prefer sentences that appear early or late (introduction/conclusion)
    const position = sentences.indexOf(sentence);
    if (position < sentences.length * 0.2 || position > sentences.length * 0.8) {
      score += 1;
    }

    return { sentence: sentence.trim(), score };
  });

  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(3, Math.ceil(sentences.length * 0.3)))
    .map(item => item.sentence);

  // Reorder sentences to maintain original flow
  const orderedSummary = sentences.filter(sentence => 
    topSentences.some(top => top.includes(sentence.trim()) || sentence.trim().includes(top))
  ).slice(0, 3);

  let summary = orderedSummary.join('. ') + '.';
  
  // Ensure summary is not too long
  if (summary.length > 500) {
    summary = summary.substring(0, 500) + '...';
  }

  return summary || text.substring(0, 300) + '...';
} 