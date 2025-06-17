"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewDocButton } from "./NewDocButton"
import { DocumentCard } from "./DocumentCard"
import { FileText, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { getDocuments } from "@/actions/documents"
import type { Document } from "@/types"
import { UserButton } from "@clerk/nextjs"

export default function WordWiseDashboard() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await getDocuments()
        setDocuments(docs)
      } catch (error) {
        console.error("Error loading documents:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [])

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const todayDocs = filteredDocuments.filter((doc) => {
    const today = new Date()
    const docDate = new Date(doc.updatedAt)
    return docDate.toDateString() === today.toDateString()
  })

  const earlierDocs = filteredDocuments.filter((doc) => {
    const today = new Date()
    const docDate = new Date(doc.updatedAt)
    return docDate.toDateString() !== today.toDateString()
  })

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-semibold">WordWise</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Free</span>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-blue-600 bg-blue-50">
              <FileText className="w-4 h-4 mr-3" />
              Documents
            </Button>
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <UserButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Documents Section */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Documents</h1>

            <div className="flex gap-4 mb-6">
              <NewDocButton />

              <div className="flex-1 max-w-md ml-auto">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {todayDocs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Today</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todayDocs.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </div>
            )}

            {earlierDocs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Earlier</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {earlierDocs.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </div>
            )}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first document</p>
                <NewDocButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 