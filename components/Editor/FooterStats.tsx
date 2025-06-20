"use client"

import type { Document, ReadabilityData } from "@/types"
import { useState, useEffect } from "react"
import { getDocumentReadabilityData } from "@/actions/documents"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronUp, ChevronDown, Brain, RefreshCw } from "lucide-react"

interface FooterStatsProps {
  document: Document
}

export function FooterStats({ document }: FooterStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [readabilityData, setReadabilityData] = useState<ReadabilityData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getWordCount = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, "").trim()
    return text ? text.split(/\s+/).length : 0
  }

  const getCharacterCount = (content: string): number => {
    return content.replace(/<[^>]*>/g, "").length
  }

  const getSentenceCount = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, "").trim()
    return text ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0
  }

  const getReadabilityColor = (score: number): string => {
    if (score >= 12) return "bg-red-500"      // Expert Level - specialized knowledge needed
    if (score >= 9) return "bg-orange-500"   // Deep Dive - requires concentration
    if (score >= 6) return "bg-yellow-500"   // Focused Reading - requires attention
    return "bg-green-500"                     // Easy Digest - quick read, broad appeal
  }

  const loadReadabilityData = async () => {
    setIsLoading(true)
    try {
      const data = await getDocumentReadabilityData(document.id)
      setReadabilityData(data)
    } catch (error) {
      console.error("Error loading readability data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isExpanded && !readabilityData) {
      loadReadabilityData()
    }
  }, [isExpanded, document.id])

  const wordCount = getWordCount(document.content)
  const characterCount = getCharacterCount(document.content)
  const sentenceCount = getSentenceCount(document.content)
  const avgWordsPerSentence = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : "0"

  const displayScore = readabilityData?.score || document.readabilityScore || 0
  const displayGrade = readabilityData?.grade || "N/A"

  return (
    <div className="border-t bg-white">
      {/* Main stats bar */}
      <div className="px-8 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
            <span>{sentenceCount} sentences</span>
            <span>Avg: {avgWordsPerSentence} words/sentence</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Readability: {displayGrade}</span>
              <div className="flex items-center gap-2">
                <span>Score: {displayScore.toFixed(1)}</span>
                <div className="w-16 h-2 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className={`h-full rounded transition-all duration-300 ${getReadabilityColor(displayScore)}`}
                    style={{ width: `${Math.min(100, (displayScore / 16) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs"
            >
              <Brain className="w-3 h-3" />
              AI Insights
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded AI insights panel */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          <ScrollArea className="h-96">
            <div className="px-8 py-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Readability Analysis
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadReadabilityData}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-500">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing readability with AI...</span>
                    </div>
                  </div>
                ) : readabilityData ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Insights */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">📊 Analysis</h4>
                      <div className="space-y-3">
                        {readabilityData.insights?.map((insight, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-white p-3 rounded-lg border-l-4 border-blue-200 shadow-sm">
                            {insight}
                          </div>
                        ))}
                        {(!readabilityData.insights || readabilityData.insights.length === 0) && (
                          <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
                            No specific insights available for this text.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Recommendations</h4>
                      <div className="space-y-3">
                        {readabilityData.recommendations?.map((rec, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-white p-3 rounded-lg border-l-4 border-green-200 shadow-sm">
                            {rec}
                          </div>
                        ))}
                        {(!readabilityData.recommendations || readabilityData.recommendations.length === 0) && (
                          <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
                            No specific recommendations available for this text.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-2">Click "Refresh" to get AI-powered readability insights</p>
                    <Badge variant="secondary" className="text-xs">
                      Enhanced analysis with OpenAI
                    </Badge>
                  </div>
                )}

                                 {/* Readability scale reference */}
                 <div className="pt-6 border-t border-gray-200">
                   <h4 className="text-xs font-medium text-gray-700 mb-3">Reading Effort Scale</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                     <div className="flex items-center gap-2 bg-white p-2 rounded">
                       <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                       <span className="text-gray-600">🟢 Easy Digest (0-6)</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white p-2 rounded">
                       <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                       <span className="text-gray-600">🟡 Focused Reading (6-9)</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white p-2 rounded">
                       <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                       <span className="text-gray-600">🟠 Deep Dive (9-12)</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white p-2 rounded">
                       <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                       <span className="text-gray-600">🔴 Expert Level (12+)</span>
                     </div>
                   </div>
                 </div>

                {/* Add some extra content to demonstrate scrolling */}
                <div className="pt-4 pb-4">
                  <div className="text-xs text-gray-400 text-center">
                    • Scroll to see all content • AI analysis updates automatically •
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
} 