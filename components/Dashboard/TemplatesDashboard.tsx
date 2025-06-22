"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TemplateCard } from "./TemplateCard"
import { Layout, Search } from "lucide-react"
import { useState } from "react"
import { templates, templateCategories, type TemplateCategory } from "@/lib/templates"

export default function TemplatesDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("All")

  const filteredTemplates = templates.filter(
    (template) => {
      const matchesSearch = 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
      
      return matchesSearch && matchesCategory
    }
  )

  // Group templates by category for display
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    const category = template.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<string, typeof templates>)

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Layout className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Sales Templates</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {templateCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {category}
                {category !== "All" && (
                  <span className="ml-1 text-xs opacity-75">
                    ({templates.filter(t => t.category === category).length})
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Templates by Category */}
        {selectedCategory === "All" ? (
          <>
            {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
              <div key={category} className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {category}
                  <span className="text-sm text-gray-500 font-normal">
                    ({categoryTemplates.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? `No templates match "${searchQuery}"` : "No templates in this category"}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 