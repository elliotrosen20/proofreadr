"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { SuggestionItem } from "./SuggestionItem"
import { CheckCircle, X } from "lucide-react"
import { useState } from "react"
import type { Document } from "@/types"

interface SuggestionDrawerProps {
  document: Document
  selectedSuggestionId: string | null
  onSuggestionSelect: (id: string | null) => void
}

export function SuggestionDrawer({ 
  document, 
  selectedSuggestionId, 
  onSuggestionSelect 
}: SuggestionDrawerProps) {
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>(null)

  const pendingSuggestions = document.suggestions.filter(s => s.status === "pending")
  const completedCount = document.suggestions.filter(s => s.status === "accepted").length

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
                docId={document.id}
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
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 