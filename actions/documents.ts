"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { documents, suggestions } from "@/db/schema/documents"
import type { SelectDocument, SelectSuggestion } from "@/db/schema/documents"
import { eq, desc, and, inArray } from "drizzle-orm"
import { readabilityScore, generateMockSuggestions, getReadabilityData } from "@/lib/readability"
import { generateSpellcheckSuggestions, generateAdvancedStyleSuggestions, generateTLDRSummary, rewriteTextTone } from "@/lib/openai"
import { uuid } from "@/lib/uuid"
import type { Document, Suggestion, ToneType, ToneRewriteResult } from "@/types"
import { revalidatePath } from "next/cache"

export async function createDocument(initialContent?: string, initialTitle?: string): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const [newDoc] = await db
    .insert(documents)
    .values({
      userId,
      title: initialTitle || "Untitled document",
      content: initialContent || "",
      readabilityScore: null,
    })
    .returning()

  revalidatePath("/")
  revalidatePath("/documents")
  return newDoc.id
}

export async function getDocuments(): Promise<Document[]> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.updatedAt))

  // Get suggestions for each document
  const docsWithSuggestions = await Promise.all(
    docs.map(async (doc: SelectDocument) => {
      const docSuggestions = await db
        .select()
        .from(suggestions)
        .where(eq(suggestions.documentId, doc.id))

      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        readabilityScore: doc.readabilityScore,
        updatedAt: doc.updatedAt.getTime(),
        suggestions: docSuggestions.map((s: SelectSuggestion) => ({
          id: s.id,
          startIndex: s.startIndex,
          endIndex: s.endIndex,
          originalText: s.originalText,
          suggestedText: s.suggestedText,
          type: s.type,
          severity: s.severity,
          status: s.status,
          createdAt: s.createdAt.getTime(),
        })) as Suggestion[],
      } as Document
    })
  )

  return docsWithSuggestions
}

export async function getSuggestions(docId: string): Promise<Suggestion[]> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify document ownership
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, docId), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

  const docSuggestions = await db
    .select()
    .from(suggestions)
    .where(eq(suggestions.documentId, docId))

  return docSuggestions.map((s: SelectSuggestion) => ({
    id: s.id,
    startIndex: s.startIndex,
    endIndex: s.endIndex,
    originalText: s.originalText,
    suggestedText: s.suggestedText,
    type: s.type,
    severity: s.severity,
    status: s.status,
    createdAt: s.createdAt.getTime(),
  })) as Suggestion[]
}

export async function getDocument(id: string): Promise<Document | null> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))

  if (!doc) return null

  const docSuggestions = await db
    .select()
    .from(suggestions)
    .where(eq(suggestions.documentId, doc.id))

  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    readabilityScore: doc.readabilityScore,
    updatedAt: doc.updatedAt.getTime(),
    suggestions: docSuggestions.map((s: SelectSuggestion) => ({
      id: s.id,
      startIndex: s.startIndex,
      endIndex: s.endIndex,
      originalText: s.originalText,
      suggestedText: s.suggestedText,
      type: s.type,
      severity: s.severity,
      status: s.status,
      createdAt: s.createdAt.getTime(),
    })) as Suggestion[],
  } as Document
}

export async function updateDocumentContent(id: string, content: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const score = await readabilityScore(content)

  await db
    .update(documents)
    .set({
      content,
      readabilityScore: score,
      updatedAt: new Date(),
    })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))

  revalidatePath("/documents/[id]", "page")
}

export async function updateDocumentTitle(id: string, title: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db
    .update(documents)
    .set({
      title,
      updatedAt: new Date(),
    })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))

  revalidatePath("/")
  revalidatePath("/documents")
  revalidatePath("/documents/[id]", "page")
}

export async function deleteDocument(id: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))

  revalidatePath("/")
  revalidatePath("/documents")
}

export async function generateSuggestions(docId: string, text: string): Promise<{ type: 'ai' | 'mock', count: number }> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify document ownership and get current content
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, docId), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

  // Check if document content has changed since analysis started
  const currentPlainText = doc.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  const analysisText = text.replace(/\s+/g, ' ').trim()
  
  if (currentPlainText !== analysisText) {
    console.log("⚠️ Document content changed during analysis - cancelling suggestion generation")
    return { type: 'mock', count: 0 }
  }

  // Generate new suggestions using OpenAI with fallback to mock suggestions
  let newSuggestions: Suggestion[] = []
  
  try {
    // Try to use OpenAI API
    if (process.env.OPENAI_API_KEY) {
      const [spellcheckSuggestions, styleSuggestions] = await Promise.all([
        generateSpellcheckSuggestions(text),
        generateAdvancedStyleSuggestions(text)
      ])
      newSuggestions = [...spellcheckSuggestions, ...styleSuggestions]
      console.log(`Generated ${newSuggestions.length} AI suggestions`)
    } else {
      throw new Error("OpenAI API key not configured")
    }
  } catch (error) {
    // Fallback to mock suggestions if OpenAI fails
    console.warn("OpenAI API failed, falling back to mock suggestions:", error)
    newSuggestions = generateMockSuggestions(text, docId)
    console.log(`Generated ${newSuggestions.length} mock suggestions`)
  }

  // Double-check content hasn't changed before saving suggestions
  const [finalDoc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, docId), eq(documents.userId, userId)))

  if (finalDoc) {
    const finalPlainText = finalDoc.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    
    if (finalPlainText !== analysisText) {
      console.log("⚠️ Document content changed during AI processing - discarding suggestions")
      return { type: 'mock', count: 0 }
    }
  }

  // Determine if we used AI or mock suggestions
  let suggestionType: 'ai' | 'mock' = 'mock'
  try {
    if (process.env.OPENAI_API_KEY && newSuggestions.length > 0) {
      suggestionType = 'ai'
    }
  } catch {
    suggestionType = 'mock'
  }

  // Clear existing pending suggestions
  await db
    .delete(suggestions)
    .where(and(eq(suggestions.documentId, docId), eq(suggestions.status, "pending")))

  // Insert new suggestions
  if (newSuggestions.length > 0) {
    await db.insert(suggestions).values(
      newSuggestions.map((s: Suggestion) => ({
        documentId: docId,
        startIndex: s.startIndex,
        endIndex: s.endIndex,
        originalText: s.originalText,
        suggestedText: s.suggestedText,
        type: s.type,
        severity: s.severity,
        status: s.status as "pending" | "accepted" | "dismissed",
        createdAt: new Date(s.createdAt),
      }))
    )
  }

  revalidatePath("/documents/[id]", "page")
  
  return { type: suggestionType, count: newSuggestions.length }
}

export async function applySuggestion(docId: string, suggestionId: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify document ownership
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, docId), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

  // Get the suggestion
  const [suggestion] = await db
    .select()
    .from(suggestions)
    .where(and(eq(suggestions.id, suggestionId), eq(suggestions.documentId, docId)))

  if (!suggestion) {
    console.warn("⚠️ Suggestion not found - likely cleared by new AI analysis:", {
      suggestionId,
      docId
    })
    // Don't throw error, just return gracefully
    return
  }

  console.log("Applying suggestion:", {
    originalText: suggestion.originalText,
    suggestedText: suggestion.suggestedText,
    currentContent: doc.content.substring(0, 200) + "..."
  })

  // Apply the suggestion to the document content
  let updatedContent = doc.content
  
  // Try multiple replacement strategies for better accuracy
  const originalText = suggestion.originalText
  const suggestedText = suggestion.suggestedText
  
  // First, try exact match replacement
  if (updatedContent.includes(originalText)) {
    updatedContent = updatedContent.replace(originalText, suggestedText)
    console.log("Applied suggestion using exact match")
  } else {
    // Try case-insensitive replacement
    const regex = new RegExp(originalText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    if (regex.test(updatedContent)) {
      updatedContent = updatedContent.replace(regex, suggestedText)
      console.log("Applied suggestion using case-insensitive match")
    } else {
      // Try word boundary replacement as fallback
      const wordBoundaryRegex = new RegExp(`\\b${originalText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
      updatedContent = updatedContent.replace(wordBoundaryRegex, suggestedText)
      console.log("Applied suggestion using word boundary match")
    }
  }

  console.log("Content updated:", {
    changed: updatedContent !== doc.content,
    newContent: updatedContent.substring(0, 200) + "..."
  })

  // Update document content
  await db
    .update(documents)
    .set({
      content: updatedContent,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, docId))

  // Mark suggestion as accepted
  await db
    .update(suggestions)
    .set({ status: "accepted" })
    .where(eq(suggestions.id, suggestionId))

  revalidatePath("/documents/[id]", "page")
}

export async function markSuggestion(
  docId: string,
  suggestionId: string,
  status: "accepted" | "dismissed"
): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify document ownership
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, docId), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

  await db
    .update(suggestions)
    .set({ status })
    .where(and(eq(suggestions.id, suggestionId), eq(suggestions.documentId, docId)))

  revalidatePath("/documents/[id]", "page")
}

export async function clearPendingSuggestions(docId: string, currentContent?: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // Verify document ownership
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, docId), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

  if (currentContent) {
    // Selective clearing - only remove suggestions where originalText no longer exists
    const pendingSuggestions = await db
      .select()
      .from(suggestions)
      .where(and(eq(suggestions.documentId, docId), eq(suggestions.status, "pending")))

    // Convert HTML to plain text for comparison
    const plainText = currentContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    
    const staleSuggestionIds: string[] = []
    
    for (const suggestion of pendingSuggestions) {
      // If the original text no longer exists exactly in the document, it's stale
      if (!plainText.includes(suggestion.originalText)) {
        staleSuggestionIds.push(suggestion.id)
      }
    }

    if (staleSuggestionIds.length > 0) {
      await db
        .delete(suggestions)
        .where(and(
          eq(suggestions.documentId, docId), 
          eq(suggestions.status, "pending"),
          // Only delete the stale ones
          inArray(suggestions.id, staleSuggestionIds)
        ))
      
      console.log(`🧹 Cleared ${staleSuggestionIds.length} stale suggestions for document:`, docId)
    } else {
      console.log("✅ No stale suggestions found - all remaining suggestions are still valid")
    }
  } else {
    // Fallback - delete all pending suggestions for this document (original behavior)
    await db
      .delete(suggestions)
      .where(and(eq(suggestions.documentId, docId), eq(suggestions.status, "pending")))

    console.log("🧹 Cleared all pending suggestions for document:", docId)
  }

  revalidatePath("/documents/[id]", "page")
}

export async function getDocumentReadabilityData(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

  try {
    const readabilityData = await getReadabilityData(doc.content)
    return readabilityData
  } catch (error) {
    console.error("Error getting readability data:", error)
    // Return basic data as fallback
    return {
      score: doc.readabilityScore || 0,
      grade: "N/A",
      insights: ["Error analyzing readability"],
      recommendations: ["Try refreshing to re-analyze"]
    }
  }
}

export async function generateDocumentTLDR(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

  try {
    // Generate TLDR using AI
    if (process.env.OPENAI_API_KEY) {
      const tldrSummary = await generateTLDRSummary(doc.content)
      if (tldrSummary) {
        return tldrSummary
      }
    }
    
    // Fallback for when AI is not available
    const plainText = doc.content.replace(/<[^>]*>/g, '').trim()
    const words = plainText.split(/\s+/)
    const wordCount = words.length
    
    if (wordCount < 50) {
      return {
        summary: plainText,
        keyPoints: ["Document is too short to summarize"],
        wordCount,
        originalWordCount: wordCount,
        compressionRatio: 1
      }
    }
    
    // Simple fallback summary (first 2 sentences)
    const sentences = plainText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0)
    const firstTwoSentences = sentences.slice(0, 2).join('. ').trim() + '.'
    const summaryWordCount = firstTwoSentences.split(/\s+/).length
    
    return {
      summary: firstTwoSentences,
      keyPoints: [
        "AI summarization unavailable - showing first sentences",
        `Document contains ${wordCount} words total`,
        "Enable OpenAI for intelligent summarization"
      ],
      wordCount: summaryWordCount,
      originalWordCount: wordCount,
      compressionRatio: Math.round((summaryWordCount / wordCount) * 100) / 100
    }
    
  } catch (error) {
    console.error("Error generating TLDR:", error)
    throw new Error("Failed to generate summary")
  }
}

export async function rewriteDocumentTone(id: string, tone: ToneType): Promise<ToneRewriteResult | null> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

  try {
    // Generate tone rewrite using AI - pass full HTML content
    if (process.env.OPENAI_API_KEY) {
      const rewriteResult = await rewriteTextTone(doc.content, tone)
      if (rewriteResult) {
        // Update document with rewritten HTML content (preserving formatting)
        await db
          .update(documents)
          .set({
            content: rewriteResult.rewrittenText, // This now contains HTML with preserved formatting
            updatedAt: new Date(),
          })
          .where(eq(documents.id, id))

        revalidatePath("/documents/[id]", "page")
        return rewriteResult
      }
    }
    
    // Fallback when AI is not available
    const plainTextFallback = doc.content.replace(/<[^>]*>/g, '').trim()
    return {
      originalText: plainTextFallback,
      rewrittenText: doc.content, // Keep original HTML when AI unavailable
      tone,
      changes: ["AI tone adjustment unavailable - original content preserved with formatting"],
      timestamp: Date.now()
    }
    
  } catch (error) {
    console.error("Error rewriting document tone:", error)
    throw new Error("Failed to rewrite document tone")
  }
} 