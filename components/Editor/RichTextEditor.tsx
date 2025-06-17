"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { updateDocumentContent, generateSuggestions, getDocument } from "@/actions/documents"
import { useIdleCallback } from "@/lib/useIdleCallback"
import { useEffect, useRef, useState } from "react"
import type { Document } from "@/types"

interface RichTextEditorProps {
  docId: string
  onWordClick?: (suggestionId: string | null) => void
}

export function RichTextEditor({ docId, onWordClick }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)
  const [document, setDocument] = useState<Document | null>(null)

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await getDocument(docId)
        setDocument(doc)
      } catch (error) {
        console.error("Error loading document:", error)
      }
    }
    loadDocument()
  }, [docId])

  const editor = useEditor({
    extensions: [StarterKit],
    content: document?.content || "",
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      updateDocumentContent(docId, content).catch(console.error)
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8",
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement
        if (target.classList.contains("misspelled") || target.classList.contains("style-suggestion")) {
          const suggestionId = target.getAttribute("data-suggestion-id")
          if (suggestionId) {
            setSelectedSuggestionId(suggestionId)
            onWordClick?.(suggestionId)
          }
        } else {
          setSelectedSuggestionId(null)
          onWordClick?.(null)
        }
        return false
      },
    },
  })

  // Generate suggestions when user stops typing
  useIdleCallback(
    800,
    () => {
      if (editor) {
        const text = editor.getText()
        generateSuggestions(docId, text).catch(console.error)
      }
    },
    [editor, document?.content]
  )

  // Update editor content when document changes
  useEffect(() => {
    if (editor && document) {
      const currentContent = editor.getHTML()
      if (currentContent !== document.content) {
        // Save current cursor position
        const { from, to } = editor.state.selection

        // Update content
        editor.commands.setContent(document.content, false)

        // Try to restore cursor position
        try {
          editor.commands.setTextSelection({
            from: Math.min(from, editor.state.doc.content.size),
            to: Math.min(to, editor.state.doc.content.size),
          })
        } catch {
          // If position is invalid, just focus at the end
          editor.commands.focus("end")
        }
      }
    }
  }, [document?.content, editor])

  // Highlight suggestions in the editor
  useEffect(() => {
    if (editor && document && editorRef.current) {
      const pendingSuggestions = document.suggestions.filter((s) => s.status === "pending")
      let editorContent = editor.getHTML()

      // Remove existing highlighting first
      editorContent = editorContent.replace(
        /<span class="(misspelled|style-suggestion)[^"]*"[^>]*>([^<]+)<\/span>/gi,
        "$2",
      )

      pendingSuggestions.forEach((suggestion) => {
        const isSelected = selectedSuggestionId === suggestion.id
        let className = ""

        if (suggestion.type === "spelling") {
          className = isSelected ? "misspelled misspelled-selected" : "misspelled"
        } else if (suggestion.type === "style") {
          className = isSelected ? "style-suggestion style-suggestion-selected" : "style-suggestion"
        }

        const regex = new RegExp(`\\b${suggestion.originalText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
        editorContent = editorContent.replace(
          regex,
          `<span class="${className}" data-suggestion-id="${suggestion.id}">${suggestion.originalText}</span>`,
        )
      })

      if (editorContent !== editor.getHTML()) {
        const currentSelection = editor.state.selection
        editor.commands.setContent(editorContent, false)
        try {
          editor.commands.setTextSelection(currentSelection)
        } catch {
          // Ignore selection errors
        }
      }
    }
  }, [document?.suggestions, editor, selectedSuggestionId])

  if (!editor) return null

  return (
    <div className="flex-1 bg-white" ref={editorRef}>
      <div className="max-w-4xl mx-auto">
        <EditorContent editor={editor} />
      </div>
      
      <style jsx global>{`
        .misspelled {
          border-bottom: 2px solid #ef4444;
          background-color: rgba(239, 68, 68, 0.1);
          cursor: pointer;
        }
        
        .misspelled-selected {
          background-color: rgba(239, 68, 68, 0.2);
        }
        
        .style-suggestion {
          border-bottom: 2px solid #3b82f6;
          background-color: rgba(59, 130, 246, 0.1);
          cursor: pointer;
        }
        
        .style-suggestion-selected {
          background-color: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  )
} 