import { uuid } from "./uuid"
import type { Suggestion } from "@/types"
import { analyzeReadabilityWithAI, getReadabilityInsights } from "./openai"

// Fallback readability score calculation
function calculateBasicReadabilityScore(text: string): number {
  const words = text.trim().split(/\s+/)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word)
  }, 0)

  if (sentences.length === 0 || words.length === 0) return 0

  // Flesch-Kincaid Grade Level formula
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length
  
  const score = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  
  return Math.max(0, Math.min(20, score))
}

function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  
  const vowels = 'aeiouy'
  let syllableCount = 0
  let previousWasVowel = false
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i])
    if (isVowel && !previousWasVowel) {
      syllableCount++
    }
    previousWasVowel = isVowel
  }
  
  // Adjust for silent 'e'
  if (word.endsWith('e')) {
    syllableCount--
  }
  
  return Math.max(1, syllableCount)
}

export async function readabilityScore(text: string): Promise<number> {
  const plainText = text.replace(/<[^>]*>/g, '').trim()
  
  if (plainText.length < 50) {
    return calculateBasicReadabilityScore(plainText)
  }

  try {
    // Try AI analysis first
    if (process.env.OPENAI_API_KEY) {
      const insights = await getReadabilityInsights(plainText)
      if (insights) {
        return insights.score
      }
    }
  } catch (error) {
    console.warn("AI readability analysis failed, using fallback:", error)
  }

  // Fallback to basic calculation
  return calculateBasicReadabilityScore(plainText)
}

export interface ReadabilityData {
  score: number
  grade: string
  insights?: string[]
  recommendations?: string[]
}

export async function getReadabilityData(text: string): Promise<ReadabilityData> {
  const plainText = text.replace(/<[^>]*>/g, '').trim()
  
  if (plainText.length < 50) {
    const score = calculateBasicReadabilityScore(plainText)
    return {
      score,
      grade: getReadabilityGrade(score),
      insights: ["Document is too short for detailed analysis"],
      recommendations: ["Add more content for better readability insights"]
    }
  }

  try {
    // Try AI analysis first
    if (process.env.OPENAI_API_KEY) {
      const insights = await getReadabilityInsights(plainText)
      if (insights) {
        return {
          score: insights.score,
          grade: insights.grade,
          insights: insights.insights,
          recommendations: insights.recommendations
        }
      }
    }
  } catch (error) {
    console.warn("AI readability analysis failed, using fallback:", error)
  }

  // Fallback to basic calculation
  const score = calculateBasicReadabilityScore(plainText)
  return {
    score,
    grade: getReadabilityGrade(score),
    insights: [
      "Using standard readability calculation",
      `Document contains ${plainText.split(/\s+/).length} words`,
      `Average sentence length: ${(plainText.split(/\s+/).length / Math.max(1, plainText.split(/[.!?]+/).length)).toFixed(1)} words per sentence`
    ],
    recommendations: [
      "Enable AI analysis for business-focused insights",
      "Consider your target audience's reading effort expectations",
      "Vary sentence structure for better professional communication"
    ]
  }
}

function getReadabilityGrade(score: number): string {
  if (score >= 12) return "Expert Level"
  if (score >= 9) return "Deep Dive"
  if (score >= 6) return "Focused Reading"
  return "Easy Digest"
}

export function generateMockSuggestions(text: string, docId: string): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Spelling corrections
  const spellingPatterns = [
    { find: /\bIm\b/gi, replace: "I'm", type: "spelling" as const },
    { find: /\bdum\b/gi, replace: "dumb", type: "spelling" as const },
    { find: /\bWhats\b/gi, replace: "What's", type: "spelling" as const },
    { find: /\byoure\b/gi, replace: "you're", type: "spelling" as const },
    { find: /\bteh\b/gi, replace: "the", type: "spelling" as const },
    { find: /\brecieve\b/gi, replace: "receive", type: "spelling" as const },
  ]

  // Style improvements
  const stylePatterns = [
    {
      find: /My name is Elliot Rosen and I'm dumb\./gi,
      replace: "My name is Elliot Rosen, and I'm not very smart.",
      type: "style" as const,
    },
    {
      find: /\bvery\b/gi,
      replace: "extremely",
      type: "style" as const,
    },
  ]

  // Process spelling patterns
  spellingPatterns.forEach((pattern) => {
    let match
    while ((match = pattern.find.exec(text)) !== null) {
      suggestions.push({
        id: uuid(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        originalText: match[0],
        suggestedText: pattern.replace,
        type: pattern.type,
        severity: "high",
        status: "pending",
        createdAt: Date.now(),
      })
    }
  })

  // Process style patterns
  stylePatterns.forEach((pattern) => {
    let match
    while ((match = pattern.find.exec(text)) !== null) {
      suggestions.push({
        id: uuid(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        originalText: match[0],
        suggestedText: pattern.replace,
        type: pattern.type,
        severity: "medium",
        status: "pending",
        createdAt: Date.now(),
      })
    }
  })

  return suggestions
} 