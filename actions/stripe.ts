"use server"

// Stripe functionality completely disabled for Grammarly app
// No imports from lib/stripe.ts to avoid environment variable dependencies

export const updateStripeCustomer = async (
  userId: string,
  subscriptionId: string,
  customerId: string
) => {
  console.log("Stripe functionality disabled")
  return null
}

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  productId: string
): Promise<"free"> => {
  console.log("Stripe functionality disabled")
  return "free"
}

export const createCheckoutUrl = async (
  paymentLinkUrl: string
): Promise<{ url: string | null; error: string | null }> => {
  return { 
    url: null, 
    error: "Billing functionality is disabled" 
  }
}
