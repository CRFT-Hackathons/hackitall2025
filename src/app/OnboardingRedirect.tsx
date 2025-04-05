"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function OnboardingRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Skip redirect if we're already on the onboarding page
    if (pathname === "/onboarding") return
    
    // Check for localStorage (only available on client side)
    if (typeof window !== 'undefined') {
      // Check if onboarding has been completed
      const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted")
      
      // If this is first visit and not on onboarding page, redirect
      if (!hasCompletedOnboarding) {
        router.push("/onboarding")
      }
    }
  }, [pathname, router])
  
  // This component doesn't render anything
  return null
} 