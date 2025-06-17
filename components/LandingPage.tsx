"use client"

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
                Responsible AI that ensures your writing and reputation shine
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
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Email Demo Header */}
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="ml-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="text-sm text-gray-600">Gmail</span>
                </div>
              </div>

              {/* Email Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">To: project-team@company.com</div>
                  <div className="text-sm text-gray-600">Subject: Project Update</div>
                </div>

                <div className="space-y-4 text-base leading-relaxed">
                  <p className="text-gray-800">
                    <span className="underline decoration-red-500 decoration-2">Would you be willing to work on this project?</span>
                  </p>
                  <p className="text-gray-800">
                    <span className="underline decoration-blue-500 decoration-2">I think it would be good to partner.</span>
                  </p>
                </div>

                {/* Suggestion Button */}
                <div className="mt-6">
                  <Button className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm">
                    Make this persuasive
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating WordWise Logo */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">W</span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-xl text-gray-600">
          Trusted by 50,000 organizations and 40 million people
        </p>
      </section>
    </div>
  )
} 