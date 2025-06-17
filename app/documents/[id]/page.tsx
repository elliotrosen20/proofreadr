import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getDocument } from "@/actions/documents"
import DocumentEditor from "@/components/Editor/DocumentEditor"

interface DocumentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  const resolvedParams = await params
  const document = await getDocument(resolvedParams.id)

  if (!document) {
    redirect("/")
  }

  return <DocumentEditor document={document} />
} 