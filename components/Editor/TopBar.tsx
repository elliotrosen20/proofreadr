"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, User, MoreHorizontal, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { updateDocumentTitle } from "@/actions/documents"
import type { Document } from "@/types"
import { UserButton } from "@clerk/nextjs"
import { TLDRModal } from "./TLDRModal"

interface TopBarProps {
  document: Document
}

export function TopBar({ document }: TopBarProps) {
  const router = useRouter()
  const [title, setTitle] = useState(document.title)
  const [isEditing, setIsEditing] = useState(false)
  const [showTLDRModal, setShowTLDRModal] = useState(false)

  const handleTitleSave = async () => {
    if (title !== document.title) {
      try {
        await updateDocumentTitle(document.id, title)
      } catch (error) {
        console.error("Failed to update title:", error)
        setTitle(document.title) // Revert on error
      }
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave()
    } else if (e.key === "Escape") {
      setTitle(document.title)
      setIsEditing(false)
    }
  }

  return (
    <>
      <div className="border-b bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-semibold text-gray-900">WordWise</span>
            </div>
            
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyDown}
                className="font-medium text-lg border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            ) : (
              <h1
                className="font-medium text-lg cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                onClick={() => setIsEditing(true)}
              >
                {document.title}
              </h1>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTLDRModal(true)}
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              TLDR
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <UserButton />
          </div>
        </div>
      </div>

      <TLDRModal
        isOpen={showTLDRModal}
        onClose={() => setShowTLDRModal(false)}
        documentId={document.id}
        documentTitle={document.title}
      />
    </>
  )
} 