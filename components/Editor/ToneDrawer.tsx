"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Palette, 
  MessageCircle, 
  Briefcase, 
  Heart, 
  Zap, 
  RotateCcw, 
  Clock,
  RefreshCw,
  X
} from "lucide-react"
import { rewriteDocumentTone } from "@/actions/documents"
import type { ToneType, ToneRewriteResult, VersionHistory } from "@/types"

interface ToneDrawerProps {
  documentId: string
  documentContent: string
  onToneApplied?: (result: ToneRewriteResult) => void
  onContentRevert?: (content: string) => void
}

export function ToneDrawer({ 
  documentId, 
  documentContent, 
  onToneApplied, 
  onContentRevert 
}: ToneDrawerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingTone, setProcessingTone] = useState<ToneType | null>(null)
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([])
  const [lastResult, setLastResult] = useState<ToneRewriteResult | null>(null)

  // Load version history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`tone-history-${documentId}`)
    if (savedHistory) {
      try {
        setVersionHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Error loading version history:", error)
      }
    }
  }, [documentId])

  // Save current content as a version
  const saveVersion = (content: string, action: string, tone?: ToneType) => {
    const newVersion: VersionHistory = {
      id: `v-${Date.now()}`,
      content,
      timestamp: Date.now(),
      action,
      tone
    }

    const updatedHistory = [newVersion, ...versionHistory].slice(0, 10) // Keep last 10 versions
    setVersionHistory(updatedHistory)
    
    // Save to localStorage
    localStorage.setItem(`tone-history-${documentId}`, JSON.stringify(updatedHistory))
  }

  const handleToneRewrite = async (tone: ToneType) => {
    if (isProcessing) return

    setIsProcessing(true)
    setProcessingTone(tone)

    try {
      // Save current content before rewriting
      saveVersion(documentContent, "Before tone change", tone)

      const result = await rewriteDocumentTone(documentId, tone)
      if (result) {
        setLastResult(result)
        onToneApplied?.(result)
        
        // Save the new version
        saveVersion(result.rewrittenText, `Rewritten to ${tone}`, tone)
      }
    } catch (error) {
      console.error("Error rewriting tone:", error)
    } finally {
      setIsProcessing(false)
      setProcessingTone(null)
    }
  }

  const handleRevert = (version: VersionHistory) => {
    onContentRevert?.(version.content)
    saveVersion(version.content, "Reverted to previous version")
  }

  const toneOptions = [
    {
      type: 'casual' as ToneType,
      label: 'Casual',
      icon: MessageCircle,
      description: 'Relaxed & conversational',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      type: 'formal' as ToneType,
      label: 'Formal',
      icon: Briefcase,
      description: 'Professional & structured',
      color: 'bg-slate-600 hover:bg-slate-700'
    },
    {
      type: 'friendly' as ToneType,
      label: 'Friendly',
      icon: Heart,
      description: 'Warm & welcoming',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      type: 'assertive' as ToneType,
      label: 'Assertive',
      icon: Zap,
      description: 'Confident & direct',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="w-96 border-r bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">Rewrite tone to be</h2>
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Rewriting to {processingTone}...</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Tone Options */}
          <div className="space-y-3">
            {toneOptions.map((option) => {
              const Icon = option.icon
              const isProcessingThis = processingTone === option.type
              
              return (
                                 <Button
                   key={option.type}
                   onClick={() => handleToneRewrite(option.type)}
                   disabled={isProcessing}
                   className={`w-full h-auto p-4 flex flex-col items-start gap-2 text-white border-none ${option.color} ${isProcessingThis ? 'opacity-75' : ''}`}
                 >
                   <div className="flex items-center gap-2 w-full min-w-0">
                     <Icon className="w-5 h-5 flex-shrink-0" />
                     <span className="font-medium truncate">{option.label}</span>
                     {isProcessingThis && (
                       <RefreshCw className="w-4 h-4 animate-spin ml-auto flex-shrink-0" />
                     )}
                   </div>
                   <span className="text-xs opacity-90 text-left w-full break-words">
                     {option.description}
                   </span>
                 </Button>
              )
            })}
          </div>

                     {/* Last Result */}
           {lastResult && (
             <div className="bg-white p-4 rounded-lg border">
               <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                 <Zap className="w-4 h-4 flex-shrink-0" />
                 <span className="truncate">Last Change: {lastResult.tone}</span>
               </h3>
               <div className="space-y-2">
                 {lastResult.changes.map((change, index) => (
                   <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded break-words leading-relaxed">
                     • {change}
                   </div>
                 ))}
               </div>
             </div>
           )}

          {/* Version History */}
          {versionHistory.length > 0 && (
            <div>
                             <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                 <Clock className="w-4 h-4 flex-shrink-0" />
                 <span className="truncate">Version History</span>
                 <Badge variant="secondary" className="text-xs flex-shrink-0">
                   {versionHistory.length}
                 </Badge>
               </h3>
              
              <div className="space-y-2">
                                 {versionHistory.slice(0, 5).map((version) => (
                   <div key={version.id} className="bg-white p-3 rounded border group hover:border-gray-300 transition-colors">
                     <div className="flex items-center justify-between mb-2 min-w-0">
                       <span className="text-xs font-medium text-gray-700 truncate flex-1">
                         {version.action}
                       </span>
                       <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                         {formatTimeAgo(version.timestamp)}
                       </span>
                     </div>
                    
                    {version.tone && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {version.tone}
                      </Badge>
                    )}
                    
                                         <div className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                       {version.content.substring(0, 120)}...
                     </div>
                    
                                         <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleRevert(version)}
                       className="w-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                     >
                       <RotateCcw className="w-3 h-3 flex-shrink-0" />
                       <span className="truncate">Revert to this</span>
                     </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 