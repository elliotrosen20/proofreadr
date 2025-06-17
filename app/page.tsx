import { auth } from "@clerk/nextjs/server"
import WordWiseDashboard from "@/components/Dashboard/GrammarlyDashboard"
import LandingPage from "@/components/LandingPage"

export default async function HomePage() {
  const { userId } = await auth()

  if (!userId) {
    return <LandingPage />
  }

  return <WordWiseDashboard />
} 