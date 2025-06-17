"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { SuggestionItem } from "./SuggestionItem"
import { CheckCircle, X } from "lucide-react"
import { useState } from "react"
import type { Suggestion } from "@/types"

interface SuggestionDrawerProps {
  suggestions: Suggestion[]
  documentId: string
  selectedSuggestionId: string | null
  onSuggestionSelect: (id: string | null) => void
  onSuggestionApplied?: () => Promise<void>
  applySuggestionInEditor?: ((suggestion: Suggestion) => Promise<boolean>) | null
  isGeneratingSuggestions?: boolean
  isUserTyping?: boolean
}

export function SuggestionDrawer({ 
  suggestions,
  documentId,
  selectedSuggestionId, 
  onSuggestionSelect,
  onSuggestionApplied,
  applySuggestionInEditor,
  isGeneratingSuggestions = false,
  isUserTyping = false
}: SuggestionDrawerProps) {
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>(null)

  const pendingSuggestions = suggestions.filter(s => s.status === "pending")
  const completedCount = suggestions.filter(s => s.status === "accepted").length

  const handleSuggestionExpand = (suggestionId: string) => {
    const newExpandedId = expandedSuggestionId === suggestionId ? null : suggestionId
    setExpandedSuggestionId(newExpandedId)
    onSuggestionSelect(newExpandedId)
  }

  return (
    <div className="w-80 border-l bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Suggestions</h2>
          <X className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {pendingSuggestions.length} to review
            </Badge>
            {completedCount > 0 && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                {completedCount} completed
              </div>
            )}
          </div>
          
          {/* Enhanced loading states */}
          {isUserTyping && !isGeneratingSuggestions && (
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ✏️ Keep typing... AI will analyze when you pause
            </div>
          )}
          
          {isGeneratingSuggestions && (
            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              🤖 AI analyzing your text...
            </div>
          )}
        </div>
      </div>

      {/* Suggestions List */}
      <ScrollArea className="flex-1">
        {pendingSuggestions.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">All done!</h3>
            <p className="text-sm text-gray-500">No suggestions to review.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {pendingSuggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                docId={documentId}
                isHighlighted={selectedSuggestionId === suggestion.id}
                isExpanded={expandedSuggestionId === suggestion.id}
                onExpand={() => handleSuggestionExpand(suggestion.id)}
                onDismiss={() => {
                  // Handle dismiss logic will be in SuggestionItem
                  if (expandedSuggestionId === suggestion.id) {
                    setExpandedSuggestionId(null)
                    onSuggestionSelect(null)
                  }
                }}
                onSuggestionApplied={onSuggestionApplied}
                applySuggestionInEditor={applySuggestionInEditor}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 