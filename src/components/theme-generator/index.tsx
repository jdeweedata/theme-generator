"use client"

import * as React from "react"
import { ThemeHeader } from "./header"
import { ThemeToolbar } from "./toolbar"
import { ColorPanel } from "./color-panel"
import { TypographyPanel } from "./typography-panel"
import { PreviewPanel } from "./preview-panel"
import { CodeDialog } from "./code-dialog"
import { ContrastCheckerDialog } from "./contrast-checker-dialog"
import { BrandWizardPanel } from "./brand-wizard-panel"
import { BrandConceptDialog } from "./brand-concept-dialog"
import { themePresets, ThemePreset, ThemeColorSet, TypographySettings, defaultTypography } from "@/lib/theme-presets"
import { BrandConcept, GenerationSection, EngineConfig } from "@/lib/brand-concept-types"

export interface ThemeState {
  preset: ThemePreset
  isDarkMode: boolean
  customColors: {
    light: ThemeColorSet
    dark: ThemeColorSet
  }
}

export function ThemeGenerator() {
  const [currentPreset, setCurrentPreset] = React.useState<ThemePreset>(themePresets[1]) // Amber Minimal
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [showCodeDialog, setShowCodeDialog] = React.useState(false)
  const [showContrastChecker, setShowContrastChecker] = React.useState(false)
  const [showBrandDialog, setShowBrandDialog] = React.useState(false)
  const [brandConcept, setBrandConcept] = React.useState<BrandConcept | null>(null)
  const [brandError, setBrandError] = React.useState<string | null>(null)
  const [brandEngineConfig, setBrandEngineConfig] = React.useState<EngineConfig | null>(null)
  const [activeTab, setActiveTab] = React.useState<"colors" | "typography" | "other" | "generate">("colors")
  const [previewTab, setPreviewTab] = React.useState<string>("cards")
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Custom colors that override the preset
  const [customColors, setCustomColors] = React.useState<{
    light: Partial<ThemeColorSet>
    dark: Partial<ThemeColorSet>
  }>({ light: {}, dark: {} })

  // Typography settings
  const [typography, setTypography] = React.useState<TypographySettings>(defaultTypography)

  // History for undo/redo
  const [history, setHistory] = React.useState<ThemePreset[]>([])
  const [historyIndex, setHistoryIndex] = React.useState(-1)

  // Get current colors (preset + custom overrides)
  const currentColors = React.useMemo(() => {
    const mode = isDarkMode ? "dark" : "light"
    return {
      ...currentPreset.colors[mode],
      ...customColors[mode],
    }
  }, [currentPreset, customColors, isDarkMode])

  // Apply theme to document
  const applyTheme = React.useCallback((colors: ThemeColorSet) => {
    if (typeof document === "undefined") return

    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })
  }, [])

  // Apply dark mode class
  React.useEffect(() => {
    if (typeof document === "undefined") return
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Apply theme when colors change
  React.useEffect(() => {
    applyTheme(currentColors)
  }, [currentColors, applyTheme])

  // Apply typography to document
  React.useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    root.style.setProperty("--font-sans", `"${typography.sansSerifFont}", system-ui, sans-serif`)
    root.style.setProperty("--font-serif", `"${typography.serifFont}", Georgia, serif`)
    root.style.setProperty("--font-mono", `"${typography.monospaceFont}", monospace`)
    root.style.setProperty("--letter-spacing", `${typography.letterSpacing}em`)
  }, [typography])

  // Load saved state
  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = localStorage.getItem("tweakcn-theme")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.preset) {
          const found = themePresets.find(p => p.name === parsed.preset)
          if (found) setCurrentPreset(found)
        }
        if (parsed.isDarkMode !== undefined) setIsDarkMode(parsed.isDarkMode)
        if (parsed.customColors) setCustomColors(parsed.customColors)
        if (parsed.typography) setTypography(parsed.typography)
      }
    } catch (e) {
      console.error("Failed to load saved theme:", e)
    }
    setIsLoaded(true)
  }, [])

  // Save state
  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem("tweakcn-theme", JSON.stringify({
        preset: currentPreset.name,
        isDarkMode,
        customColors,
        typography,
      }))
    } catch (e) {
      console.error("Failed to save theme:", e)
    }
  }, [currentPreset, isDarkMode, customColors, typography, isLoaded])

  // Update a color
  const updateColor = (key: keyof ThemeColorSet, value: string) => {
    const mode = isDarkMode ? "dark" : "light"
    setCustomColors(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: value,
      },
    }))
  }

  // Update typography
  const updateTypography = (key: keyof TypographySettings, value: string | number) => {
    setTypography(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // Reset typography
  const resetTypography = () => {
    setTypography(defaultTypography)
  }

  // Select preset
  const selectPreset = (preset: ThemePreset) => {
    setCurrentPreset(preset)
    setCustomColors({ light: {}, dark: {} })
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), preset])
    setHistoryIndex(prev => prev + 1)
  }

  // Reset to preset defaults
  const resetTheme = () => {
    setCustomColors({ light: {}, dark: {} })
  }

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setCurrentPreset(history[historyIndex - 1])
    }
  }

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setCurrentPreset(history[historyIndex + 1])
    }
  }

  // Handle brand concept generation complete
  const handleBrandComplete = (concept: BrandConcept, engineConfig?: EngineConfig) => {
    setBrandConcept(concept)
    setBrandError(null)
    setBrandEngineConfig(engineConfig || null)
    setShowBrandDialog(true)
  }

  // Handle brand concept error
  const handleBrandError = (error: string) => {
    setBrandError(error)
  }

  // Handle applying brand theme
  const handleApplyBrandTheme = (preset: ThemePreset) => {
    selectPreset(preset)
  }

  // Handle regenerating a section
  const handleRegenerateSection = async (section: GenerationSection) => {
    if (!brandConcept) return

    try {
      const response = await fetch("/api/brand-concept", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brief: brandConcept.brief,
          section,
          existingConcept: brandConcept,
          engineConfig: brandEngineConfig,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to regenerate section")
      }

      setBrandConcept(data.concept)
    } catch (error) {
      console.error("Regeneration failed:", error)
      throw error
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <ThemeHeader />

      {/* Toolbar */}
      <ThemeToolbar
        currentPreset={currentPreset}
        presets={themePresets}
        isDarkMode={isDarkMode}
        onSelectPreset={selectPreset}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onUndo={undo}
        onRedo={redo}
        onReset={resetTheme}
        onShowCode={() => setShowCodeDialog(true)}
        onShowContrastChecker={() => setShowContrastChecker(true)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Color Controls */}
        <div className="w-[420px] border-r flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b px-4">
            {(["colors", "typography", "other", "generate"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "generate" ? "✨ Generate" : tab}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === "colors" && (
              <ColorPanel
                colors={currentColors}
                isDarkMode={isDarkMode}
                onColorChange={updateColor}
              />
            )}
            {activeTab === "typography" && (
              <TypographyPanel
                typography={typography}
                onTypographyChange={updateTypography}
                onReset={resetTypography}
              />
            )}
            {activeTab === "other" && (
              <div className="p-4 text-muted-foreground text-sm">
                Other settings coming soon...
              </div>
            )}
            {activeTab === "generate" && (
              <div className="h-full flex flex-col">
                {brandError && (
                  <div className="m-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {brandError}
                  </div>
                )}
                <BrandWizardPanel
                  onComplete={handleBrandComplete}
                  onError={handleBrandError}
                />
                {brandConcept && (
                  <div className="p-4 border-t">
                    <button
                      onClick={() => setShowBrandDialog(true)}
                      className="w-full px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      View Generated Concept
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <PreviewPanel
            activeTab={previewTab}
            onTabChange={setPreviewTab}
          />
        </div>
      </div>

      {/* Code Dialog */}
      <CodeDialog
        open={showCodeDialog}
        onOpenChange={setShowCodeDialog}
        preset={currentPreset}
        customColors={customColors}
        isDarkMode={isDarkMode}
      />

      {/* Contrast Checker Dialog */}
      <ContrastCheckerDialog
        open={showContrastChecker}
        onOpenChange={setShowContrastChecker}
        colors={currentColors}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Brand Concept Dialog */}
      <BrandConceptDialog
        open={showBrandDialog}
        onOpenChange={setShowBrandDialog}
        concept={brandConcept}
        onApplyTheme={handleApplyBrandTheme}
        onRegenerate={handleRegenerateSection}
      />
    </div>
  )
}
