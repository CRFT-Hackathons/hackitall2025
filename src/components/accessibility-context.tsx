"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type AccessibilityContextType = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  darkMode: false,
  setDarkMode: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  // Apply the no-animations class to the document body when the setting changes

  // Apply dark mode class when the setting changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <AccessibilityContext.Provider
      value={{
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}
