"use client"

import { TopBar } from "./TopBar"
import { RichTextEditor } from "./RichTextEditor"
import { SuggestionDrawer } from "./SuggestionDrawer"
import { FooterStats } from "./FooterStats"
import { useState, useEffect, useCallback } from "react"
import { getSuggestions } from "@/actions/documents"
import type { Document, Suggestion } from "@/types"

interface DocumentEditorProps {
  document: Document
}

export default function DocumentEditor({ document }: DocumentEditorProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(document.suggestions || [])
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)
  const [syncEditor, setSyncEditor] = useState<(() => Promise<void>) | null>(null)

  // Load suggestions
  useEffect(() => {
    let isMounted = true
    
    const loadSuggestions = async () => {
      try {
        const docSuggestions = await getSuggestions(document.id)
        if (isMounted) {
          setSuggestions(docSuggestions)
        }
      } catch (error) {
        console.error("Error loading suggestions:", error)
      }
    }
    
    loadSuggestions()
    
    // Poll for new suggestions every 5 seconds
    const interval = setInterval(loadSuggestions, 5000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [document.id])

  const handleEditorReady = useCallback((syncFunction: () => Promise<void>) => {
    setSyncEditor(() => syncFunction)
  }, [])

  const handleSuggestionApplied = useCallback(async () => {
    // Sync editor with database after suggestion is applied
    if (syncEditor) {
      await syncEditor()
    }
    // Reload suggestions
    try {
      const docSuggestions = await getSuggestions(document.id)
      setSuggestions(docSuggestions)
    } catch (error) {
      console.error("Error reloading suggestions:", error)
    }
  }, [syncEditor, document.id])

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar document={document} />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <RichTextEditor docId={document.id} onEditorReady={handleEditorReady} />
          <FooterStats document={document} />
        </div>
        
        <SuggestionDrawer 
          suggestions={suggestions}
          documentId={document.id}
          selectedSuggestionId={selectedSuggestionId}
          onSuggestionSelect={setSelectedSuggestionId}
          onSuggestionApplied={handleSuggestionApplied}
        />
      </div>
    </div>
  )
} 