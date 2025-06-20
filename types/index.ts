export type User = {
  id: "u_demo"
  email: "demo@example.com"
  name: "Demo User"
}

export type Suggestion = {
  id: string
  startIndex: number
  endIndex: number
  originalText: string
  suggestedText: string
  type: "grammar" | "spelling" | "style"
  severity: "low" | "medium" | "high"
  status: "pending" | "accepted" | "dismissed"
  createdAt: number
}

export type Document = {
  id: string
  title: string
  content: string
  readabilityScore: number | null
  updatedAt: number
  suggestions: Suggestion[]
}

export interface ReadabilityData {
  score: number
  grade: string
  insights?: string[]
  recommendations?: string[]
}

export interface TLDRSummary {
  summary: string
  keyPoints: string[]
  wordCount: number
  originalWordCount: number
  compressionRatio: number
}

export type ToneType = 'casual' | 'formal' | 'friendly' | 'assertive'

export interface ToneRewriteResult {
  originalText: string
  rewrittenText: string
  tone: ToneType
  changes: string[]
  timestamp: number
}

export interface VersionHistory {
  id: string
  content: string
  timestamp: number
  action: string
  tone?: ToneType
} 