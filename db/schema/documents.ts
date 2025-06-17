import { pgTable, text, timestamp, uuid, integer, pgEnum, jsonb, real } from "drizzle-orm/pg-core"

export const suggestionType = pgEnum("suggestion_type", ["grammar", "spelling", "style"])
export const suggestionSeverity = pgEnum("suggestion_severity", ["low", "medium", "high"])
export const suggestionStatus = pgEnum("suggestion_status", ["pending", "accepted", "dismissed"])

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  readabilityScore: real("readability_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const suggestions = pgTable("suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  startIndex: integer("start_index").notNull(),
  endIndex: integer("end_index").notNull(),
  originalText: text("original_text").notNull(),
  suggestedText: text("suggested_text").notNull(),
  type: suggestionType("type").notNull(),
  severity: suggestionSeverity("severity").notNull(),
  status: suggestionStatus("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type InsertDocument = typeof documents.$inferInsert
export type SelectDocument = typeof documents.$inferSelect

export type InsertSuggestion = typeof suggestions.$inferInsert
export type SelectSuggestion = typeof suggestions.$inferSelect 