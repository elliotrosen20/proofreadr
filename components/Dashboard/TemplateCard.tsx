"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Users, Phone, TrendingUp, BarChart, Calendar, CheckSquare, FileText, DollarSign } from "lucide-react"
import { createDocument } from "@/actions/documents"
import { useRouter } from "next/navigation"
import type { Template } from "@/lib/templates"

interface TemplateCardProps {
  template: Template
}

const iconMap = {
  Mail,
  Users,
  Phone,
  TrendingUp,
  BarChart,
  Calendar,
  CheckSquare,
  FileText,
  DollarSign,
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter()
  const IconComponent = iconMap[template.icon as keyof typeof iconMap] || FileText

  const handleUseTemplate = async () => {
    try {
      const docId = await createDocument(template.content, template.title)
      router.push(`/documents/${docId}`)
    } catch (error) {
      console.error("Failed to create document from template:", error)
    }
  }

  const getPreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prospecting':
        return 'bg-blue-100 text-blue-800'
      case 'Follow-up':
        return 'bg-green-100 text-green-800'
      case 'Meetings':
        return 'bg-purple-100 text-purple-800'
      case 'Closing':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-blue-600" />
            </div>
            <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
              {template.category}
            </Badge>
          </div>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {template.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>
        
        <p className="text-xs text-gray-500 mb-4 line-clamp-3 flex-1">
          {getPreview(template.content)}
        </p>
        
        <Button 
          onClick={handleUseTemplate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  )
} 