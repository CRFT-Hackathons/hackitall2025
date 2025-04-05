import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AccessibilityProvider } from "@/components/accessibility-context";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AccessInterview - Accessible Interview Platform",
  description: "An accessible interview platform for everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AccessibilityProvider>
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
            </AccessibilityProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
