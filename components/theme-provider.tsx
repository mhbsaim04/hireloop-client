"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

// next-themes injects an inline <script> to prevent a theme flash. React 19 warns about
// script tags in dev, but that script already ran in the server-rendered HTML, so the
// warning is harmless. Filter only this exact message, and only in development.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  const originalConsoleError = console.error

  console.error = (...args: unknown[]) => {
    const isScriptTagWarning = args.some(
      (arg) =>
        typeof arg === "string" &&
        arg.includes("Encountered a script tag while rendering React component")
    )

    if (isScriptTagWarning) {
      return
    }

    originalConsoleError(...args)
  }
}

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (!event.key || event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }