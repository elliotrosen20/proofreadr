"use server"

// Stripe functionality disabled for Grammarly app
// Re-enable when billing features are needed

import { SelectCustomer } from "@/db/schema/customers"

type MembershipStatus = SelectCustomer["membership"]

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
): Promise<MembershipStatus> => {
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
