import { config } from "dotenv"
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { customers } from "./schema/customers"
import { documents, suggestions } from "./schema/documents"

config({ path: ".env.local" })

const dbSchema = {
  // tables
  customers,
  documents,
  suggestions
  // relations
}

function initializeDb(url: string) {
  const client = postgres(url, { prepare: false })
  return drizzlePostgres(client, { schema: dbSchema })
}

const databaseUrl = process.env.DATABASE_URL

// Create a mock database object for development when DATABASE_URL is not set
const mockDb = {
  select: () => ({ 
    from: () => ({ 
      where: () => ({ 
        orderBy: () => Promise.resolve([])
      }) 
    }) 
  }),
  insert: () => ({ 
    values: () => ({ 
      returning: () => Promise.resolve([{ id: "mock-id" }])
    }) 
  }),
  update: () => ({ 
    set: () => ({ 
      where: () => Promise.resolve()
    }) 
  }),
  delete: () => ({ 
    where: () => Promise.resolve()
  })
} as any

export const db = databaseUrl ? initializeDb(databaseUrl) : mockDb

if (!databaseUrl) {
  console.warn("DATABASE_URL is not set - running with mock database for development")
}
