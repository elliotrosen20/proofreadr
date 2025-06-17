"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { updateDocumentContent, getDocument, generateSuggestions } from "@/actions/documents"
import { useIdleCallback } from "@/lib/useIdleCallback"
import { useEffect, useState, useRef } from "react"
import type { Document, Suggestion } from "@/types"

interface RichTextEditorProps {
  docId: string
  onEditorReady?: (syncFunction: () => Promise<void>) => void
  onGenerationStateChange?: (isGenerating: boolean, isTyping: boolean) => void
  onApplySuggestionReady?: (applySuggestionFunction: (suggestion: Suggestion) => Promise<boolean>) => void
}

export function RichTextEditor({ 
  docId, 
  onEditorReady, 
  onGenerationStateChange, 
  onApplySuggestionReady 
}: RichTextEditorProps) {
  const [document, setDocument] = useState<Document | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [userInputContent, setUserInputContent] = useState<string>("")
  const isApplyingSuggestion = useRef(false)
  const lastGeneratedContent = useRef<string>("")

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      
      // Only update if not currently applying a suggestion
      if (!isApplyingSuggestion.current) {
        updateDocumentContent(docId, content).catch(console.error)
        
        // Track user input for suggestion generation
        const plainText = editor.getText()
        setUserInputContent(plainText)
        
        // Mark user as typing
        setIsTyping(true)
        onGenerationStateChange?.(isGenerating, true)
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8",
      },
    },
  })

  // Function to apply suggestion directly in the editor
  const applySuggestionInEditor = async (suggestion: Suggestion): Promise<boolean> => {
    if (!editor) return false

    try {
      // Set flag to prevent triggering new suggestions during application
      isApplyingSuggestion.current = true
      
      const { originalText, suggestedText } = suggestion

      console.log("🔧 Applying suggestion in editor:", { originalText, suggestedText })

      // Use TipTap's proper text search that accounts for HTML structure
      const doc = editor.state.doc
      let found = false
      let replaceFrom = 0
      let replaceTo = 0

      // Search through the document for the text
      doc.descendants((node, pos) => {
        if (node.isText && node.text) {
          const textContent = node.text
          const index = textContent.indexOf(originalText)
          
          if (index !== -1) {
            // Found the text! Calculate proper positions
            replaceFrom = pos + index
            replaceTo = pos + index + originalText.length
            found = true
            return false // Stop searching
          }
        }
        return true // Continue searching
      })

      if (!found) {
        console.warn("❌ Original text not found in editor:", originalText)
        return false
      }

      console.log("📍 Found text at positions:", { replaceFrom, replaceTo })

      // Replace the text in the editor using proper positions
      editor.chain()
        .focus()
        .setTextSelection({ from: replaceFrom, to: replaceTo })
        .insertContent(suggestedText)
        .run()

      console.log("✅ Suggestion applied successfully in editor")
      
      // Save the updated content to database
      const updatedContent = editor.getHTML()
      await updateDocumentContent(docId, updatedContent)
      
      // Update tracking variables
      const newPlainText = editor.getText()
      setUserInputContent(newPlainText)
      lastGeneratedContent.current = newPlainText
      
      return true
    } catch (error) {
      console.error("❌ Error applying suggestion in editor:", error)
      return false
    } finally {
      // Always reset the flag
      isApplyingSuggestion.current = false
    }
  }

  // Generate suggestions when user stops typing - only on actual user input
  useIdleCallback(
    2000, // 2 second delay after user stops typing
    async () => {
      if (editor && !isGenerating && !isApplyingSuggestion.current) {
        const currentText = userInputContent.trim()
        
        // Only generate if content has actually changed since last generation
        if (currentText.length > 10 && currentText !== lastGeneratedContent.current) {
          console.log("🤖 Starting AI analysis for new content...")
          
          setIsGenerating(true)
          setIsTyping(false)
          onGenerationStateChange?.(true, false)
          
          try {
            const result = await generateSuggestions(docId, currentText)
            console.log(`✅ AI analysis complete: ${result.count} ${result.type} suggestions generated`)
            
            // Update tracking
            lastGeneratedContent.current = currentText
          } catch (error) {
            console.error("Error generating suggestions:", error)
          } finally {
            setIsGenerating(false)
            onGenerationStateChange?.(false, false)
          }
        } else {
          // Just update typing state without generating
          setIsTyping(false)
          onGenerationStateChange?.(false, false)
        }
      }
    },
    [userInputContent, isGenerating] // Only trigger on user input changes
  )

  // Load initial document content
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await getDocument(docId)
        if (doc && editor) {
          setDocument(doc)
          editor.commands.setContent(doc.content, false)
          
          // Initialize tracking variables
          const plainText = editor.getText()
          setUserInputContent(plainText)
          lastGeneratedContent.current = plainText
        }
      } catch (error) {
        console.error("Error loading document:", error)
      }
    }
    
    if (editor) {
      loadDocument()
    }
  }, [docId, editor])

  // Provide sync function to parent
  useEffect(() => {
    if (editor && onEditorReady) {
      const syncWithDatabase = async () => {
        try {
          const updatedDoc = await getDocument(docId)
          if (updatedDoc) {
            setDocument(updatedDoc)
            // Save cursor position
            const { from, to } = editor.state.selection
            // Update content
            editor.commands.setContent(updatedDoc.content, false)
            // Try to restore cursor position
            try {
              editor.commands.setTextSelection({ from, to })
            } catch {
              // If cursor position is invalid, just focus at end
              editor.commands.focus("end")
            }
          }
        } catch (error) {
          console.error("Error syncing editor:", error)
        }
      }
      
      onEditorReady(syncWithDatabase)
    }
  }, [editor, onEditorReady, docId])

  // Provide applySuggestion function to parent
  useEffect(() => {
    if (editor && onApplySuggestionReady) {
      onApplySuggestionReady(applySuggestionInEditor)
    }
  }, [editor, onApplySuggestionReady])

  if (!editor) return null

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-4xl mx-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
} 