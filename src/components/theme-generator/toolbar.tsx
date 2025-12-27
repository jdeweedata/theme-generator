"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ThemePreset } from "@/lib/theme-presets"
import {
  ChevronDown,
  Moon,
  Sun,
  Undo2,
  Redo2,
  RotateCcw,
  Code2,
  Search,
  Check,
  Contrast,
} from "lucide-react"

interface ThemeToolbarProps {
  currentPreset: ThemePreset
  presets: ThemePreset[]
  isDarkMode: boolean
  onSelectPreset: (preset: ThemePreset) => void
  onToggleDarkMode: () => void
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onShowCode: () => void
  onShowContrastChecker: () => void
  canUndo: boolean
  canRedo: boolean
}

export function ThemeToolbar({
  currentPreset,
  presets,
  isDarkMode,
  onSelectPreset,
  onToggleDarkMode,
  onUndo,
  onRedo,
  onReset,
  onShowCode,
  onShowContrastChecker,
  canUndo,
  canRedo,
}: ThemeToolbarProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)

  const filteredPresets = presets.filter((preset) =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get color swatches for a preset
  const getSwatches = (preset: ThemePreset) => {
    const colors = isDarkMode ? preset.colors.dark : preset.colors.light
    return [colors.primary, colors.secondary, colors.accent, colors.muted]
  }

  // Parse HSL string to get background color
  const hslToStyle = (hsl: string) => `hsl(${hsl})`

  return (
    <div className="h-12 border-b flex items-center justify-between px-4 gap-4">
      {/* Left side - Theme selector */}
      <div className="flex items-center gap-2">
        {/* Theme dropdown */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 min-w-[200px] justify-start"
            >
              {/* Color swatches */}
              <div className="flex gap-0.5">
                {getSwatches(currentPreset).slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm border"
                    style={{ backgroundColor: hslToStyle(color) }}
                  />
                ))}
              </div>
              <span className="flex-1 text-left">{currentPreset.name}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search themes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Theme count and actions */}
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filteredPresets.length} themes
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleDarkMode}>
                {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>

            {/* Presets list */}
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                  Built-in Themes
                </div>
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      onSelectPreset(preset)
                      setIsOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    {/* Color swatches */}
                    <div className="flex gap-0.5">
                      {getSwatches(preset).slice(0, 4).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-sm border"
                          style={{ backgroundColor: hslToStyle(color) }}
                        />
                      ))}
                    </div>
                    <span className="flex-1 text-left text-sm">{preset.name}</span>
                    {currentPreset.name === preset.name && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleDarkMode}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Reset */}
        <Button variant="ghost" size="sm" className="gap-2" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        {/* Contrast Checker */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShowContrastChecker} title="Contrast Checker">
          <Contrast className="h-4 w-4" />
        </Button>

        {/* Code */}
        <Button variant="ghost" size="sm" className="gap-2" onClick={onShowCode}>
          <Code2 className="h-4 w-4" />
          Code
        </Button>
      </div>
    </div>
  )
}
