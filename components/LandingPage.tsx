"use client"

// Updated landing page messaging - professional focus
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"

export default function LandingPage() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">WordWise</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-gray-900">Log in</button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Sign up
                </Button>
              </SignUpButton>
            </nav>

            {/* Mobile navigation */}
            <div className="md:hidden flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-gray-900 text-sm">Log in</button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded">
                  Sign up
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Write with confidence. Close deals.
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Work with an AI writing partner that helps you find the words you need—to write that 
                tricky email, to get your point across, to keep your work moving.
              </p>
            </div>

            <div className="space-y-4">
              <SignUpButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg flex items-center gap-2">
                  Sign up
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </SignUpButton>
            </div>
          </div>

          {/* Right Column - Demo */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-2xl">W</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">Writing Assistant for Sales Professionals</h3>
                  <p className="text-gray-600">
                    AI-powered suggestions for grammar, style, and clarity to help you communicate effectively
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 