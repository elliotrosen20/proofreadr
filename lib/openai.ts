import OpenAI from 'openai'
import type { Suggestion } from "@/types"
import { uuid } from "./uuid"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface OpenAISuggestion {
  originalText: string
  suggestedText: string
  type: 'spelling' | 'style' | 'grammar'
  explanation: string
  startIndex: number
  endIndex: number
}

export async function generateSpellcheckSuggestions(text: string): Promise<Suggestion[]> {
  try {
    const prompt = `
You are a professional editor and spellchecker. Analyze the following text and identify:

1. SPELLING ERRORS - misspelled words that need correction
2. STYLE IMPROVEMENTS - opportunities to improve clarity, conciseness, or readability

For each issue you find, provide:
- The exact original text that needs to be changed
- The suggested replacement
- The type (spelling or style)
- A brief explanation
- The character position where the issue starts and ends

Text to analyze:
"${text}"

Respond with a JSON array of suggestions in this format:
[
  {
    "originalText": "exact text to replace",
    "suggestedText": "replacement text",
    "type": "spelling" | "style",
    "explanation": "brief explanation of the issue",
    "startIndex": 0,
    "endIndex": 10
  }
]

Only include legitimate issues. If no issues are found, return an empty array [].
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional editor that returns only valid JSON arrays of suggestions. Be precise with character positions and only suggest real improvements."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      return []
    }

    // Parse the JSON response (handle markdown-wrapped JSON)
    let openaiSuggestions: OpenAISuggestion[] = []
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      openaiSuggestions = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError)
      console.error("Raw response:", content)
      return []
    }

    // Convert to our Suggestion format
    const suggestions: Suggestion[] = openaiSuggestions.map((suggestion) => {
      // Find actual positions in the text for better accuracy
      const actualStartIndex = text.toLowerCase().indexOf(suggestion.originalText.toLowerCase())
      const actualEndIndex = actualStartIndex !== -1 
        ? actualStartIndex + suggestion.originalText.length
        : suggestion.endIndex

      return {
        id: uuid(),
        startIndex: actualStartIndex !== -1 ? actualStartIndex : suggestion.startIndex,
        endIndex: actualEndIndex,
        originalText: suggestion.originalText,
        suggestedText: suggestion.suggestedText,
        type: suggestion.type === 'grammar' ? 'spelling' : suggestion.type, // Map grammar to spelling
        severity: suggestion.type === 'spelling' ? 'high' : 'medium',
        status: 'pending',
        createdAt: Date.now(),
      }
    })

    return suggestions

  } catch (error) {
    console.error("Error generating OpenAI suggestions:", error)
    return []
  }
}

export async function generateAdvancedStyleSuggestions(text: string): Promise<Suggestion[]> {
  try {
    const prompt = `
You are an expert writing coach. Analyze this text for advanced style improvements:

1. CLARITY - Replace unclear or ambiguous phrasing
2. CONCISENESS - Remove redundant words or phrases  
3. TONE - Improve professionalism or readability
4. WORD CHOICE - Suggest more precise or impactful words
5. SENTENCE STRUCTURE - Improve flow and rhythm

Text: "${text}"

Focus on meaningful improvements that enhance the writing quality. Return JSON array:
[
  {
    "originalText": "exact phrase to replace",
    "suggestedText": "improved version", 
    "type": "style",
    "explanation": "why this improves the text",
    "startIndex": 0,
    "endIndex": 15
  }
]
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a writing coach that provides style improvements as valid JSON. Focus on substantial improvements, not minor changes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      return []
    }

    let openaiSuggestions: OpenAISuggestion[] = []
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      openaiSuggestions = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error("Failed to parse OpenAI style response:", parseError)
      return []
    }

    const suggestions: Suggestion[] = openaiSuggestions.map((suggestion) => {
      const actualStartIndex = text.toLowerCase().indexOf(suggestion.originalText.toLowerCase())
      const actualEndIndex = actualStartIndex !== -1 
        ? actualStartIndex + suggestion.originalText.length
        : suggestion.endIndex

      return {
        id: uuid(),
        startIndex: actualStartIndex !== -1 ? actualStartIndex : suggestion.startIndex,
        endIndex: actualEndIndex,
        originalText: suggestion.originalText,
        suggestedText: suggestion.suggestedText,
        type: 'style',
        severity: 'medium',
        status: 'pending',
        createdAt: Date.now(),
      }
    })

    return suggestions

  } catch (error) {
    console.error("Error generating style suggestions:", error)
    return []
  }
} 