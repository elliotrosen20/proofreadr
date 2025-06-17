"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Trash2, Edit3 } from "lucide-react"  
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteDocument } from "@/actions/documents"
import { useRouter } from "next/navigation"
import type { Document } from "@/types"

interface DocumentCardProps {
  document: Document
}

export function DocumentCard({ document }: DocumentCardProps) {
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/documents/${document.id}`)
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(document.id)
        window.location.reload() // Simple reload for now
      } catch (error) {
        console.error("Failed to delete document:", error)
      }
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getPreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleEdit}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
            {document.title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit() }}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); handleDelete() }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {getPreview(document.content) || "No content"}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(document.updatedAt)}</span>
          {document.suggestions && document.suggestions.length > 0 && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
              {document.suggestions.filter(s => s.status === 'pending').length} suggestions
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 