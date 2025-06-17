"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { documents, suggestions } from "@/db/schema/documents"
import type { SelectDocument, SelectSuggestion } from "@/db/schema/documents"
import { eq, desc, and } from "drizzle-orm"
import { readabilityScore, generateMockSuggestions } from "@/lib/readability"
import { generateSpellcheckSuggestions, generateAdvancedStyleSuggestions } from "@/lib/openai"
import { uuid } from "@/lib/uuid"
import type { Document, Suggestion } from "@/types"
import { revalidatePath } from "next/cache"

export async function createDocument(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const [newDoc] = await db
    .insert(documents)
    .values({
      userId,
      title: "Untitled document",
      content: "",
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

  const score = readabilityScore(content)

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

  // Verify document ownership
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, docId), eq(documents.userId, userId)))

  if (!doc) throw new Error("Document not found")

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