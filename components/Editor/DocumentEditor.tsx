"use client"

import { useState } from "react"
import { TopBar } from "./TopBar"
import { RichTextEditor } from "./RichTextEditor"
import { SuggestionDrawer } from "./SuggestionDrawer"
import { FooterStats } from "./FooterStats"
import type { Document } from "@/types"

interface DocumentEditorProps {
  document: Document
}

export default function DocumentEditor({ document }: DocumentEditorProps) {
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopBar document={document} />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <RichTextEditor 
            docId={document.id} 
            onWordClick={setSelectedSuggestionId}
          />
          <FooterStats document={document} />
        </div>
        
        <SuggestionDrawer
          document={document}
          selectedSuggestionId={selectedSuggestionId}
          onSuggestionSelect={setSelectedSuggestionId}
        />
      </div>
    </div>
  )
} 