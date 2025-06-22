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
    // Add logging for analysis
    console.log(`🔍 Starting spellcheck analysis for ${text.length} characters`)
    
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
    }, {
      timeout: text.length > 2000 ? 20000 : 15000, // 20s for long text, 15s for shorter
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      console.log("⚠️ Empty response from OpenAI spellcheck")
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
      console.error("Failed to parse OpenAI spellcheck response:", parseError)
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

    console.log(`✅ Spellcheck generated ${suggestions.length} suggestions`)
    return suggestions

  } catch (error) {
    console.error("❌ Error generating OpenAI spellcheck suggestions:", error)
    return []
  }
}

export async function generateAdvancedStyleSuggestions(text: string): Promise<Suggestion[]> {
  try {
    // Add logging for analysis
    console.log(`✍️ Starting style analysis for ${text.length} characters`)
    
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
    }, {
      timeout: text.length > 2000 ? 20000 : 15000, // 20s for long text, 15s for shorter
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      console.log("⚠️ Empty response from OpenAI style analysis")
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
      console.error("Raw response:", content)
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

    console.log(`✅ Style analysis generated ${suggestions.length} suggestions`)
    return suggestions

  } catch (error) {
    console.error("❌ Error generating style suggestions:", error)
    return []
  }
}

// AI-powered readability analysis
export interface ReadabilityAnalysis {
  fleschKincaidGrade: number
  fleschReadingEase: number
  smogIndex: number
  automatedReadabilityIndex: number
  averageGradeLevel: number
  readabilityGrade: string
  insights: string[]
  recommendations: string[]
  sentenceComplexity: 'simple' | 'moderate' | 'complex'
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced'
  clarity: number // 1-10 scale
}

export async function analyzeReadabilityWithAI(text: string): Promise<ReadabilityAnalysis | null> {
  try {
    const prompt = `
You are a professional writing consultant specializing in business communication. Analyze the following text for readability from a working professional's perspective.

Text to analyze:
"${text}"

Rate the text using these professional reading effort levels:
- Easy Digest (0-6): Quick read, broad appeal, suitable for executives and busy professionals
- Focused Reading (6-9): Requires attention but accessible, good for team communications and reports  
- Deep Dive (9-12): Detailed content requiring concentration, suitable for technical documentation
- Expert Level (12+): Specialized knowledge needed, complex analysis or legal language

Calculate readability metrics and provide professional insights:
1. Flesch-Kincaid Grade Level
2. Flesch Reading Ease Score (0-100)
3. SMOG Index
4. Automated Readability Index (ARI)
5. Average grade level
6. Professional readability assessment
7. Business communication insights
8. Recommendations for workplace effectiveness

Respond with JSON in this exact format:
{
  "fleschKincaidGrade": 8.5,
  "fleschReadingEase": 65.2,
  "smogIndex": 9.1,
  "automatedReadabilityIndex": 8.8,
  "averageGradeLevel": 8.6,
  "readabilityGrade": "Focused Reading",
  "insights": [
    "Your writing is well-suited for professional team communication",
    "Sentence length averaging 15 words makes this accessible to busy professionals",
    "Technical terms are balanced with clear explanations"
  ],
  "recommendations": [
    "Perfect readability level for business reports and proposals",
    "Consider adding executive summary for C-suite distribution",
    "Use bullet points to make key insights more scannable"
  ],
  "sentenceComplexity": "moderate",
  "vocabularyLevel": "professional",
  "clarity": 7.5
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a business writing expert that provides readability analysis for working professionals. Focus on workplace communication effectiveness and provide practical insights for business contexts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      return null
    }

    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      const analysis: ReadabilityAnalysis = JSON.parse(cleanContent)
      return analysis
    } catch (parseError) {
      console.error("Failed to parse readability analysis:", parseError)
      console.error("Raw response:", content)
      return null
    }

  } catch (error) {
    console.error("Error analyzing readability with AI:", error)
    return null
  }
}

export async function getReadabilityInsights(text: string): Promise<{
  score: number
  grade: string
  insights: string[]
  recommendations: string[]
} | null> {
  try {
    const analysis = await analyzeReadabilityWithAI(text)
    if (!analysis) return null

    return {
      score: analysis.averageGradeLevel,
      grade: analysis.readabilityGrade,
      insights: analysis.insights,
      recommendations: analysis.recommendations
    }
  } catch (error) {
    console.error("Error getting readability insights:", error)
    return null
  }
}

// TLDR Summary generation
export interface TLDRSummary {
  summary: string
  keyPoints: string[]
  wordCount: number
  originalWordCount: number
  compressionRatio: number
}

export async function generateTLDRSummary(text: string): Promise<TLDRSummary | null> {
  try {
    const plainText = text.replace(/<[^>]*>/g, '').trim()
    const originalWordCount = plainText.split(/\s+/).length

    // Don't summarize very short texts
    if (originalWordCount < 50) {
      return {
        summary: plainText,
        keyPoints: ["Document is too short to summarize effectively"],
        wordCount: originalWordCount,
        originalWordCount,
        compressionRatio: 1
      }
    }

    const prompt = `
You are a professional summarization expert specializing in business communication. Create a concise TLDR (Too Long; Didn't Read) summary of the following text for working professionals.

Text to summarize:
"${plainText}"

Provide a response in this exact JSON format:
{
  "summary": "A clear, professional summary in 2-3 sentences that captures the main business value and key outcomes",
  "keyPoints": [
    "First key point focusing on actionable insights",
    "Second key point highlighting important decisions or findings", 
    "Third key point emphasizing business impact or next steps"
  ]
}

Guidelines for professional summaries:
- Keep the summary under 100 words and business-focused
- Extract 2-5 key points that matter to decision-makers
- Focus on outcomes, decisions, and actionable insights
- Use professional language suitable for workplace communication
- Highlight business value and practical implications
- Maintain the professional tone of the original content
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional summarization expert that creates concise, accurate summaries. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      return null
    }

    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      const parsed = JSON.parse(cleanContent)
      const summaryWordCount = parsed.summary.split(/\s+/).length
      const compressionRatio = Math.round((summaryWordCount / originalWordCount) * 100) / 100

      return {
        summary: parsed.summary,
        keyPoints: parsed.keyPoints || [],
        wordCount: summaryWordCount,
        originalWordCount,
        compressionRatio
      }
    } catch (parseError) {
      console.error("Failed to parse TLDR response:", parseError)
      console.error("Raw response:", content)
      return null
    }

  } catch (error) {
    console.error("Error generating TLDR summary:", error)
    return null
  }
}

// Tone rewriting functionality
export type ToneType = 'casual' | 'formal' | 'friendly' | 'assertive'

export interface ToneRewriteResult {
  originalText: string
  rewrittenText: string
  tone: ToneType
  changes: string[]
  timestamp: number
}

export async function rewriteTextTone(text: string, tone: ToneType): Promise<ToneRewriteResult | null> {
  try {
    // Keep the original HTML content instead of stripping it
    const htmlContent = text.trim()
    
    // Extract plain text only for length checking
    const plainTextForCheck = text.replace(/<[^>]*>/g, '').trim()
    
    if (plainTextForCheck.length < 10) {
      return null // Too short to meaningfully rewrite
    }

    const toneDescriptions = {
      casual: "relaxed, conversational, and approachable while maintaining professionalism",
      formal: "professional, structured, and authoritative with proper business language",
      friendly: "warm, personable, and welcoming while staying professional",
      assertive: "confident, direct, and decisive with clear action-oriented language"
    }

    const prompt = `
You are a professional writing coach specializing in tone adjustment for business communication. Rewrite the following HTML content to be ${toneDescriptions[tone]}.

CRITICAL: You must preserve ALL HTML formatting exactly as it appears. Only change the text content between HTML tags.

Original HTML content:
${htmlContent}

HTML Preservation Rules:
- Keep ALL HTML tags exactly the same: <p>, <strong>, <em>, <br>, <ul>, <li>, <a>, etc.
- Do NOT add, remove, or modify any HTML tags
- Do NOT change any HTML attributes
- ONLY change the text content between the opening and closing tags
- Maintain the exact HTML structure and hierarchy

Guidelines for ${tone} tone:
${tone === 'casual' ? `
- Use contractions (don't, won't, it's)
- Shorter, more conversational sentences
- Friendly but professional language
- Approachable and relatable phrasing` : ''}
${tone === 'formal' ? `
- Avoid contractions (do not, will not, it is)
- Use complete, structured sentences
- Professional vocabulary and terminology
- Maintain respectful, authoritative tone` : ''}
${tone === 'friendly' ? `
- Use warm, welcoming language
- Include personal touches where appropriate
- Positive and encouraging phrasing
- Maintain professional boundaries` : ''}
${tone === 'assertive' ? `
- Use strong, confident language
- Direct and action-oriented phrasing
- Clear statements and expectations
- Decisive and authoritative tone` : ''}

Respond with JSON in this exact format:
{
  "rewrittenText": "The complete HTML content with preserved tags but rewritten text content",
  "changes": [
    "Changed 'I think maybe' to 'I recommend' for more assertive language",
    "Replaced formal phrases with conversational alternatives",
    "Added warmer, more personal language"
  ]
}

Example:
Input: <p>I think maybe we should <strong>consider</strong> this option.</p>
Output for assertive: <p>I recommend we <strong>implement</strong> this option.</p>

Preserve:
- All factual information and meaning
- Professional appropriateness
- All HTML formatting and structure
- Key technical terms when necessary
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional tone adjustment expert. Rewrite HTML content to match the requested tone while preserving ALL HTML formatting exactly. Never add, remove, or modify HTML tags - only change text content between tags. Always respond with valid JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      return null
    }

    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      const parsed = JSON.parse(cleanContent)
      
      return {
        originalText: plainTextForCheck, // Plain text for display purposes
        rewrittenText: parsed.rewrittenText, // Full HTML with preserved formatting
        tone,
        changes: parsed.changes || [],
        timestamp: Date.now()
      }
    } catch (parseError) {
      console.error("Failed to parse tone rewrite response:", parseError)
      console.error("Raw response:", content)
      return null
    }

  } catch (error) {
    console.error("Error rewriting text tone:", error)
    return null
  }
}