"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { FileText, Clock, RefreshCw, Copy, Check } from "lucide-react"
import { generateDocumentTLDR } from "@/actions/documents"
import type { TLDRSummary } from "@/types"

interface TLDRModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentTitle: string
}

export function TLDRModal({ isOpen, onClose, documentId, documentTitle }: TLDRModalProps) {
  const [tldrData, setTldrData] = useState<TLDRSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleGenerateTLDR = async () => {
    setIsLoading(true)
    try {
      const summary = await generateDocumentTLDR(documentId)
      setTldrData(summary)
    } catch (error) {
      console.error("Error generating TLDR:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!tldrData) return
    
    const copyText = `TLDR of "${documentTitle}":

${tldrData.summary}

Key Points:
${tldrData.keyPoints.map(point => `• ${point}`).join('\n')}

(${tldrData.wordCount} words, ${(tldrData.compressionRatio * 100).toFixed(0)}% of original)`

    try {
      await navigator.clipboard.writeText(copyText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      // Reset state when closing
      setTimeout(() => {
        setTldrData(null)
        setIsCopied(false)
      }, 300)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            TLDR Summary
          </DialogTitle>
          <DialogDescription>
            AI-generated summary of "{documentTitle}"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-6">
            {!tldrData && !isLoading && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generate TLDR</h3>
                <p className="text-gray-500 mb-4">Create a concise summary of your document</p>
                <Button onClick={handleGenerateTLDR} className="gap-2">
                  <Clock className="w-4 h-4" />
                  Generate Summary
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Generating TLDR...</h3>
                  <p className="text-gray-500">AI is analyzing your document</p>
                </div>
              </div>
            )}

            {tldrData && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{tldrData.wordCount}</div>
                      <div className="text-xs text-gray-600">Summary Words</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{tldrData.originalWordCount}</div>
                      <div className="text-xs text-gray-600">Original Words</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{(tldrData.compressionRatio * 100).toFixed(0)}%</div>
                      <div className="text-xs text-gray-600">Compression</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📝 Summary
                    <Badge variant="secondary" className="text-xs">
                      {tldrData.wordCount} words
                    </Badge>
                  </h4>
                  <div className="bg-blue-50 border-l-4 border-blue-200 p-4 rounded-r-lg">
                    <p className="text-gray-800 leading-relaxed">{tldrData.summary}</p>
                  </div>
                </div>

                {/* Key Points */}
                {tldrData.keyPoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      🔑 Key Points
                      <Badge variant="secondary" className="text-xs">
                        {tldrData.keyPoints.length} points
                      </Badge>
                    </h4>
                    <div className="space-y-2">
                      {tldrData.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-200">
                          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 text-sm">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateTLDR}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Summary
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 