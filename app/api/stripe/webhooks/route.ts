// Stripe webhook functionality disabled for Grammarly app
// Re-enable when billing features are needed

export async function POST(req: Request) {
  return new Response(
    JSON.stringify({
      error: "Stripe webhooks are disabled"
    }),
    {
      status: 410, // Gone
      headers: { "Content-Type": "application/json" }
    }
  )
}
