"use client"

import { TopBar } from "./TopBar"
import { RichTextEditor } from "./RichTextEditor"
import { SuggestionDrawer } from "./SuggestionDrawer"
import { FooterStats } from "./FooterStats"
import { useState, useEffect, useCallback } from "react"
import { getSuggestions, getDocument } from "@/actions/documents"
import type { Document, Suggestion } from "@/types"

interface DocumentEditorProps {
  document: Document
}

// Function to validate if a suggestion is still applicable to current content
const validateSuggestion = (suggestion: Suggestion, currentContent: string): boolean => {
  // Extract plain text from HTML content
  const plainText = currentContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  
  // Check if the original text still exists in the document
  return plainText.includes(suggestion.originalText)
}

export default function DocumentEditor({ document }: DocumentEditorProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(document.suggestions || [])
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)
  const [syncEditor, setSyncEditor] = useState<(() => Promise<void>) | null>(null)
  const [applySuggestionInEditor, setApplySuggestionInEditor] = useState<((suggestion: Suggestion) => Promise<boolean>) | null>(null)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [currentDocumentContent, setCurrentDocumentContent] = useState<string>(document.content)

  // Load suggestions and validate them against current content
  useEffect(() => {
    let isMounted = true
    
    const loadSuggestions = async () => {
      try {
        const docSuggestions = await getSuggestions(document.id)
        
        if (isMounted) {
          // Filter out stale suggestions
          const validSuggestions = docSuggestions.filter(suggestion => 
            validateSuggestion(suggestion, currentDocumentContent)
          )
          
          const staleCount = docSuggestions.length - validSuggestions.length
          if (staleCount > 0) {
            console.log(`🧹 Filtered out ${staleCount} stale suggestions`)
          }
          
          setSuggestions(validSuggestions)
        }
      } catch (error) {
        console.error("Error loading suggestions:", error)
      }
    }
    
    loadSuggestions()
    
    // Reduced polling - only check every 30 seconds and only when not actively generating
    const interval = setInterval(() => {
      if (!isGeneratingSuggestions && !isUserTyping) {
        loadSuggestions()
      }
    }, 30000) // Changed from 5000ms to 30000ms
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [document.id, isGeneratingSuggestions, isUserTyping, currentDocumentContent])

  // Track document content changes
  useEffect(() => {
    setCurrentDocumentContent(document.content)
  }, [document.content])

  const handleEditorReady = useCallback((syncFunction: () => Promise<void>) => {
    setSyncEditor(() => syncFunction)
  }, [])

  const handleApplySuggestionReady = useCallback((applySuggestionFunction: (suggestion: Suggestion) => Promise<boolean>) => {
    setApplySuggestionInEditor(() => applySuggestionFunction)
  }, [])

  const handleGenerationStateChange = useCallback((isGenerating: boolean, isTyping: boolean) => {
    setIsGeneratingSuggestions(isGenerating)
    setIsUserTyping(isTyping)
  }, [])

  const handleSuggestionApplied = useCallback(async () => {
    // Reload suggestions after one is applied and update current content
    try {
      const docSuggestions = await getSuggestions(document.id)
      
      // Get updated document content
      const updatedDoc = await getDocument(document.id)
      if (updatedDoc) {
        setCurrentDocumentContent(updatedDoc.content)
        
        // Filter suggestions based on updated content
        const validSuggestions = docSuggestions.filter(suggestion => 
          validateSuggestion(suggestion, updatedDoc.content)
        )
        
        setSuggestions(validSuggestions)
      } else {
        setSuggestions(docSuggestions)
      }
    } catch (error) {
      console.error("Error reloading suggestions:", error)
    }
  }, [document.id])

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar document={document} />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <RichTextEditor 
            docId={document.id} 
            onEditorReady={handleEditorReady}
            onGenerationStateChange={handleGenerationStateChange}
            onApplySuggestionReady={handleApplySuggestionReady}
          />
          <FooterStats document={document} />
        </div>
        
        <SuggestionDrawer 
          suggestions={suggestions}
          documentId={document.id}
          selectedSuggestionId={selectedSuggestionId}
          onSuggestionSelect={setSelectedSuggestionId}
          onSuggestionApplied={handleSuggestionApplied}
          applySuggestionInEditor={applySuggestionInEditor}
          isGeneratingSuggestions={isGeneratingSuggestions}
          isUserTyping={isUserTyping}
        />
      </div>
    </div>
  )
} 