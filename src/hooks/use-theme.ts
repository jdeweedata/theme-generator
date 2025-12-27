"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ThemeColors,
  themePresets,
  hslToString,
  getForegroundColor,
  getMutedForeground,
} from "@/lib/theme-utils"

const STORAGE_KEY = "theme-generator-colors"
const DARK_MODE_KEY = "theme-generator-dark-mode"

export function useTheme() {
  const [lightColors, setLightColors] = useState<ThemeColors>(
    themePresets.default.light
  )
  const [darkColors, setDarkColors] = useState<ThemeColors>(
    themePresets.default.dark
  )
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activePreset, setActivePreset] = useState<string>("default")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved theme from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY)
      const savedDarkMode = localStorage.getItem(DARK_MODE_KEY)

      if (savedTheme) {
        const parsed = JSON.parse(savedTheme)
        if (parsed.light) setLightColors(parsed.light)
        if (parsed.dark) setDarkColors(parsed.dark)
        if (parsed.preset) setActivePreset(parsed.preset)
      }

      if (savedDarkMode) {
        setIsDarkMode(savedDarkMode === "true")
      }
    } catch (e) {
      console.error("Failed to load saved theme:", e)
    }

    setIsLoaded(true)
  }, [])

  // Apply CSS variables to document
  const applyTheme = useCallback((colors: ThemeColors) => {
    if (typeof document === "undefined") return

    const root = document.documentElement

    // Primary colors
    root.style.setProperty("--primary", hslToString(colors.primary))
    root.style.setProperty(
      "--primary-foreground",
      hslToString(getForegroundColor(colors.primary))
    )

    // Secondary colors
    root.style.setProperty("--secondary", hslToString(colors.secondary))
    root.style.setProperty(
      "--secondary-foreground",
      hslToString(getForegroundColor(colors.secondary))
    )

    // Accent colors
    root.style.setProperty("--accent", hslToString(colors.accent))
    root.style.setProperty(
      "--accent-foreground",
      hslToString(getForegroundColor(colors.accent))
    )

    // Muted colors
    root.style.setProperty("--muted", hslToString(colors.muted))
    root.style.setProperty(
      "--muted-foreground",
      hslToString(getMutedForeground(colors.background))
    )

    // Destructive colors
    root.style.setProperty("--destructive", hslToString(colors.destructive))
    root.style.setProperty(
      "--destructive-foreground",
      hslToString(getForegroundColor(colors.destructive))
    )

    // Background colors
    root.style.setProperty("--background", hslToString(colors.background))
    root.style.setProperty(
      "--foreground",
      hslToString(getForegroundColor(colors.background))
    )

    // Card colors
    root.style.setProperty("--card", hslToString(colors.card))
    root.style.setProperty(
      "--card-foreground",
      hslToString(getForegroundColor(colors.card))
    )

    // Popover colors
    root.style.setProperty("--popover", hslToString(colors.popover))
    root.style.setProperty(
      "--popover-foreground",
      hslToString(getForegroundColor(colors.popover))
    )

    // Border and input
    root.style.setProperty("--border", hslToString(colors.border))
    root.style.setProperty("--input", hslToString(colors.border))

    // Ring (focus ring color, matches primary)
    root.style.setProperty("--ring", hslToString(colors.primary))

    // Radius
    root.style.setProperty("--radius", `${colors.radius}rem`)
  }, [])

  // Apply theme when colors change
  useEffect(() => {
    if (!isLoaded) return

    const currentColors = isDarkMode ? darkColors : lightColors
    applyTheme(currentColors)
  }, [lightColors, darkColors, isDarkMode, isLoaded, applyTheme])

  // Toggle dark mode
  useEffect(() => {
    if (typeof document === "undefined") return

    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    localStorage.setItem(DARK_MODE_KEY, String(isDarkMode))
  }, [isDarkMode])

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          light: lightColors,
          dark: darkColors,
          preset: activePreset,
        })
      )
    } catch (e) {
      console.error("Failed to save theme:", e)
    }
  }, [lightColors, darkColors, activePreset, isLoaded])

  // Update a specific color in the current theme (light or dark)
  const updateColor = useCallback(
    (colorKey: keyof ThemeColors, value: ThemeColors[keyof ThemeColors]) => {
      if (isDarkMode) {
        setDarkColors((prev) => ({ ...prev, [colorKey]: value }))
      } else {
        setLightColors((prev) => ({ ...prev, [colorKey]: value }))
      }
      setActivePreset("custom")
    },
    [isDarkMode]
  )

  // Apply a preset theme
  const applyPreset = useCallback((presetName: string) => {
    const preset = themePresets[presetName]
    if (preset) {
      setLightColors(preset.light)
      setDarkColors(preset.dark)
      setActivePreset(presetName)
    }
  }, [])

  // Reset to default theme
  const resetTheme = useCallback(() => {
    applyPreset("default")
  }, [applyPreset])

  // Get current colors based on dark mode
  const currentColors = isDarkMode ? darkColors : lightColors

  return {
    lightColors,
    darkColors,
    currentColors,
    isDarkMode,
    activePreset,
    isLoaded,
    setIsDarkMode,
    updateColor,
    applyPreset,
    resetTheme,
    setLightColors,
    setDarkColors,
  }
}
