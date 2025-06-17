"use client"

import type { Document } from "@/types"

interface FooterStatsProps {
  document: Document
}

export function FooterStats({ document }: FooterStatsProps) {
  const getWordCount = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, "").trim()
    return text ? text.split(/\s+/).length : 0
  }

  const getCharacterCount = (content: string): number => {
    return content.replace(/<[^>]*>/g, "").length
  }

  const getReadabilityGrade = (score: number | null): string => {
    if (!score) return "N/A"
    
    if (score >= 13) return "College graduate"
    if (score >= 12) return "College"
    if (score >= 9) return "High school"
    if (score >= 6) return "Middle school"
    return "Elementary"
  }

  const wordCount = getWordCount(document.content)
  const characterCount = getCharacterCount(document.content)
  const readabilityGrade = getReadabilityGrade(document.readabilityScore)

  return (
    <div className="border-t bg-white px-8 py-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-6">
          <span>{wordCount} words</span>
          <span>{characterCount} characters</span>
          <span>Readability: {readabilityGrade}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {document.readabilityScore && (
            <div className="flex items-center gap-2">
              <span>Score: {document.readabilityScore.toFixed(1)}</span>
              <div className="w-16 h-2 bg-gray-200 rounded">
                <div 
                  className="h-full bg-green-500 rounded"
                  style={{ width: `${Math.min(100, (document.readabilityScore / 12) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 