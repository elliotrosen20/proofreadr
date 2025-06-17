"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { updateDocumentContent, getDocument } from "@/actions/documents"
import { useEffect, useState } from "react"
import type { Document } from "@/types"

interface RichTextEditorProps {
  docId: string
  onEditorReady?: (syncFunction: () => Promise<void>) => void
}

export function RichTextEditor({ docId, onEditorReady }: RichTextEditorProps) {
  const [document, setDocument] = useState<Document | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      updateDocumentContent(docId, content).catch(console.error)
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8",
      },
    },
  })

  // Load initial document content
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await getDocument(docId)
        if (doc && editor) {
          setDocument(doc)
          editor.commands.setContent(doc.content, false)
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

  if (!editor) return null

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-4xl mx-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
} 