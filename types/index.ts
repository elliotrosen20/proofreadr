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