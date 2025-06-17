"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Suggestion } from "@/types"
import { Copy, MoreHorizontal, Info, ChevronRight } from "lucide-react"
import { markSuggestion } from "@/actions/documents"

interface SuggestionItemProps {
  suggestion: Suggestion
  docId: string
  onDismiss: () => void
  isHighlighted?: boolean
  isExpanded: boolean
  onExpand: () => void
  onSuggestionApplied?: () => Promise<void>
  applySuggestionInEditor?: ((suggestion: Suggestion) => Promise<boolean>) | null
}

export function SuggestionItem({
  suggestion,
  docId,
  onDismiss,
  isHighlighted = false,
  isExpanded,
  onExpand,
  onSuggestionApplied,
  applySuggestionInEditor,
}: SuggestionItemProps) {

  const handleAccept = async () => {
    console.log("✅ Accepting suggestion:", suggestion.originalText, "->", suggestion.suggestedText)
    
    if (!applySuggestionInEditor) {
      console.error("❌ No applySuggestionInEditor function available!")
      return
    }

    try {
      // Apply suggestion directly in the editor
      const success = await applySuggestionInEditor(suggestion)
      
      if (success) {
        console.log("✅ Suggestion applied successfully in editor")
        
        // Mark the suggestion as accepted in the database
        await markSuggestion(docId, suggestion.id, "accepted")
        
        // Refresh the UI
        if (onSuggestionApplied) {
          console.log("🔄 Calling onSuggestionApplied callback...")
          await onSuggestionApplied()
          console.log("✅ onSuggestionApplied callback completed")
        }
      } else {
        console.warn("⚠️ Suggestion could not be applied - text may have changed")
        // Still refresh the UI in case the suggestion is no longer valid
        if (onSuggestionApplied) {
          await onSuggestionApplied()
        }
      }
    } catch (error) {
      console.error("❌ Error accepting suggestion:", error)
      // Still try to refresh the UI
      if (onSuggestionApplied) {
        await onSuggestionApplied()
      }
    }
  }

  const handleDismiss = async () => {
    try {
      await markSuggestion(docId, suggestion.id, "dismissed")
      onDismiss()
      if (onSuggestionApplied) {
        await onSuggestionApplied()
      }
    } catch (error) {
      console.error("Error dismissing suggestion:", error)
    }
  }

  const getIcon = () => {
    switch (suggestion.type) {
      case "spelling":
        return (
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
          </div>
        )
      case "style":
        return (
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
          </div>
        )
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
          </div>
        )
    }
  }

  const getTypeLabel = () => {
    switch (suggestion.type) {
      case "spelling":
        return "Correct your spelling"
      case "style":
        return "Improve your text"
      default:
        return "Grammar correction"
    }
  }

  if (suggestion.status !== "pending") return null

  // Collapsed view
  if (!isExpanded) {
    return (
      <div
        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
          isHighlighted ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
        }`}
        onClick={onExpand}
      >
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">{getTypeLabel()}</div>
            <div className="font-medium text-gray-900">
              {suggestion.type === "style" ? suggestion.originalText.substring(0, 50) + "..." : suggestion.originalText}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    )
  }

  // Expanded view
  return (
    <Card
      className={`transition-all duration-200 ${
        isHighlighted ? "border-red-300 shadow-md ring-2 ring-red-200" : "border-gray-200"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs font-medium">
                {suggestion.type === "spelling" ? "Correctness" : "Clarity"}
              </Badge>
              <span className="text-sm text-gray-600">• {getTypeLabel()}</span>
              <Info className="w-4 h-4 text-gray-400 ml-auto" />
            </div>

            <div className="mb-4">
              <span className="text-base text-gray-700">
                <span className="text-gray-500 line-through">{suggestion.originalText}</span>{" "}
                <span className="font-semibold text-green-600">{suggestion.suggestedText}</span>
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2"
                onClick={handleAccept}
                disabled={!applySuggestionInEditor}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-gray-600 border-gray-300 px-4 py-2"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
              <Button size="sm" variant="ghost" className="p-2 text-gray-500">
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 