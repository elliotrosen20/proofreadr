"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createDocument } from "@/actions/documents"
import { useRouter } from "next/navigation"

export function NewDocButton() {
  const router = useRouter()

  const handleCreateDocument = async () => {
    try {
      const docId = await createDocument()
      router.push(`/documents/${docId}`)
    } catch (error) {
      console.error("Failed to create document:", error)
    }
  }

  return (
    <Button onClick={handleCreateDocument} className="bg-blue-600 hover:bg-blue-700">
      <Plus className="w-4 h-4 mr-2" />
      New document
    </Button>
  )
} 