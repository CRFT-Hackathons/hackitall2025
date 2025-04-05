"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

// Moved metadata to a separate variable since it can't be exported from a client component
const siteMetadata = {
  title: "InAble - Accessible Interview Platform",
  description: "An accessible interview platform for everyone",
};

// This component checks if onboarding is completed and redirects if needed
function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if we're already on the onboarding page
    if (pathname === "/onboarding") return;

    // Check if onboarding has been completed
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");

    // If this is first visit and not on onboarding page, redirect
    if (!hasCompletedOnboarding) {
      router.push("/onboarding");
    }
  }, [pathname, router]);

  return <>{children}</>;
}

// This component applies accessibility settings from localStorage
function AccessibilitySettings({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply saved settings on app load
    try {
      // Font size
      const fontSize = localStorage.getItem("fontSize");
      if (fontSize) {
        document.documentElement.style.fontSize = `${fontSize}px`;
      }

      // Dyslexic font
      const useDyslexicFont = localStorage.getItem("useDyslexicFont");
      if (useDyslexicFont === "true") {
        document.body.classList.add("dyslexic-font");
      }

      // Color blind mode
      const colorBlindMode = localStorage.getItem("colorBlindMode");
      if (colorBlindMode && colorBlindMode !== "none") {
        document.body.setAttribute("data-color-blind-mode", colorBlindMode);
      }

      // High contrast
      const highContrast = localStorage.getItem("highContrast");
      if (highContrast === "true") {
        document.body.classList.add("high-contrast");
      }

      // Animations
      const disableAnimations = localStorage.getItem("disableAnimations");
      if (disableAnimations === "true") {
        document.body.classList.add("reduce-motion");
      }
    } catch (error) {
      console.error("Error applying accessibility settings:", error);
    }
  }, []);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{siteMetadata.title}</title>
        <meta name="description" content={siteMetadata.description} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <OnboardingCheck>
            <AccessibilitySettings>
              {/* SVG filters for color blindness */}
              <svg
                className="absolute"
                style={{ height: 0, width: 0, position: "absolute" }}
              >
                <defs>
                  {/* Protanopia Filter */}
                  <filter id="protanopia-filter">
                    <feColorMatrix
                      type="matrix"
                      values="0.567, 0.433, 0, 0, 0
                                0.558, 0.442, 0, 0, 0
                                0, 0.242, 0.758, 0, 0
                                0, 0, 0, 1, 0"
                    />
                  </filter>

                  {/* Deuteranopia Filter */}
                  <filter id="deuteranopia-filter">
                    <feColorMatrix
                      type="matrix"
                      values="0.625, 0.375, 0, 0, 0
                                0.7, 0.3, 0, 0, 0
                                0, 0.3, 0.7, 0, 0
                                0, 0, 0, 1, 0"
                    />
                  </filter>

                  {/* Tritanopia Filter */}
                  <filter id="tritanopia-filter">
                    <feColorMatrix
                      type="matrix"
                      values="0.95, 0.05, 0, 0, 0
                                0, 0.433, 0.567, 0, 0
                                0, 0.475, 0.525, 0, 0
                                0, 0, 0, 1, 0"
                    />
                  </filter>
                </defs>
              </svg>

              {children}
            </AccessibilitySettings>
          </OnboardingCheck>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
