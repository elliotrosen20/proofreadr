import { uuid } from "./uuid"
import type { Suggestion } from "@/types"

export function readabilityScore(text: string): number {
  // Mock readability score calculation
  const wordCount = text.split(/\s+/).length
  const sentenceCount = text.split(/[.!?]+/).length
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1)

  // Simple mock formula
  return Math.max(1, Math.min(12, 7 + Math.random() * 3 + avgWordsPerSentence / 10))
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