"use client"

import { TopBar } from "./TopBar"
import { RichTextEditor } from "./RichTextEditor"
import { SuggestionDrawer } from "./SuggestionDrawer"
import { ToneDrawer } from "./ToneDrawer"
import { FooterStats } from "./FooterStats"
import { useState, useEffect, useCallback } from "react"
import { getSuggestions, getDocument, updateDocumentContent } from "@/actions/documents"
import type { Document, Suggestion, ToneRewriteResult } from "@/types"

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
  const [directContentUpdate, setDirectContentUpdate] = useState<((content: string) => Promise<void>) | null>(null)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [currentDocumentContent, setCurrentDocumentContent] = useState<string>(document.content)
  const [currentDocument, setCurrentDocument] = useState<Document>(document)

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
    setCurrentDocument(document)
  }, [document.content])

  const handleEditorReady = useCallback((syncFunction: () => Promise<void>) => {
    setSyncEditor(() => syncFunction)
  }, [])

  const handleApplySuggestionReady = useCallback((applySuggestionFunction: (suggestion: Suggestion) => Promise<boolean>) => {
    setApplySuggestionInEditor(() => applySuggestionFunction)
  }, [])

  const handleDirectContentUpdateReady = useCallback((updateFunction: (content: string) => Promise<void>) => {
    setDirectContentUpdate(() => updateFunction)
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
        setCurrentDocument(updatedDoc)
        
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

  const handleToneApplied = useCallback(async (result: ToneRewriteResult) => {
    // Update the document content when tone is applied
    try {
      const updatedDoc = await getDocument(document.id)
      if (updatedDoc) {
        setCurrentDocumentContent(updatedDoc.content)
        setCurrentDocument(updatedDoc)
        
        // Sync the editor with the new content
        if (syncEditor) {
          await syncEditor()
        }
      }
    } catch (error) {
      console.error("Error syncing after tone change:", error)
    }
  }, [document.id, syncEditor])

  const handleContentRevert = useCallback(async (content: string) => {
    // Revert to a previous version using direct content update
    try {
      if (directContentUpdate) {
        await directContentUpdate(content)
        
        // Update local state
        setCurrentDocumentContent(content)
        const updatedDoc = { ...currentDocument, content }
        setCurrentDocument(updatedDoc)
        
        console.log("✅ Content reverted successfully")
      } else {
        console.warn("❌ Direct content update function not available")
      }
    } catch (error) {
      console.error("Error reverting content:", error)
    }
  }, [directContentUpdate, currentDocument])

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar document={currentDocument} />
      
      <div className="flex flex-1 overflow-hidden">
        <ToneDrawer 
          documentId={document.id}
          documentContent={currentDocumentContent}
          onToneApplied={handleToneApplied}
          onContentRevert={handleContentRevert}
        />
        
        <div className="flex-1 flex flex-col">
          <RichTextEditor 
            docId={document.id} 
            onEditorReady={handleEditorReady}
            onGenerationStateChange={handleGenerationStateChange}
            onApplySuggestionReady={handleApplySuggestionReady}
            onDirectContentUpdateReady={handleDirectContentUpdateReady}
          />
          <FooterStats document={currentDocument} />
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