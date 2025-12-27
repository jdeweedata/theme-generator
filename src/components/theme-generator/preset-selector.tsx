"use client"

import * as React from "react"
import { themePresets, hslToHex } from "@/lib/theme-utils"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface PresetSelectorProps {
  activePreset: string
  onSelectPreset: (preset: string) => void
  isDarkMode: boolean
}

const presetInfo: Record<string, { name: string; description: string }> = {
  default: { name: "Default", description: "Warm orange accent" },
  ocean: { name: "Ocean", description: "Cool blue tones" },
  forest: { name: "Forest", description: "Natural green hues" },
  sunset: { name: "Sunset", description: "Warm orange-red" },
  rose: { name: "Rose", description: "Soft pink elegance" },
  midnight: { name: "Midnight", description: "Deep purple tones" },
}

export function PresetSelector({
  activePreset,
  onSelectPreset,
  isDarkMode,
}: PresetSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
      {Object.entries(themePresets).map(([key, preset]) => {
        const colors = isDarkMode ? preset.dark : preset.light
        const isActive = activePreset === key
        const info = presetInfo[key]

        return (
          <button
            key={key}
            onClick={() => onSelectPreset(key)}
            className={cn(
              "relative flex flex-col items-start p-3 rounded-lg border-2 transition-all",
              "hover:border-primary/50 hover:shadow-md",
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card"
            )}
          >
            {isActive && (
              <div className="absolute top-2 right-2">
                <Check className="w-4 h-4 text-primary" />
              </div>
            )}

            {/* Color swatches */}
            <div className="flex gap-1 mb-2">
              <div
                className="w-6 h-6 rounded-full border shadow-sm"
                style={{ backgroundColor: hslToHex(colors.primary) }}
                title="Primary"
              />
              <div
                className="w-6 h-6 rounded-full border shadow-sm"
                style={{ backgroundColor: hslToHex(colors.secondary) }}
                title="Secondary"
              />
              <div
                className="w-6 h-6 rounded-full border shadow-sm"
                style={{ backgroundColor: hslToHex(colors.accent) }}
                title="Accent"
              />
              <div
                className="w-6 h-6 rounded-full border shadow-sm"
                style={{ backgroundColor: hslToHex(colors.background) }}
                title="Background"
              />
            </div>

            {/* Preset name and description */}
            <span className="text-sm font-medium text-foreground">
              {info?.name || key}
            </span>
            <span className="text-xs text-muted-foreground">
              {info?.description || ""}
            </span>
          </button>
        )
      })}

      {/* Custom indicator */}
      {activePreset === "custom" && (
        <div
          className={cn(
            "relative flex flex-col items-start p-3 rounded-lg border-2",
            "border-primary bg-primary/5 shadow-sm"
          )}
        >
          <div className="absolute top-2 right-2">
            <Check className="w-4 h-4 text-primary" />
          </div>

          <div className="flex gap-1 mb-2">
            <div className="w-6 h-6 rounded-full border shadow-sm bg-gradient-to-br from-primary to-accent" />
          </div>

          <span className="text-sm font-medium text-foreground">Custom</span>
          <span className="text-xs text-muted-foreground">Your custom theme</span>
        </div>
      )}
    </div>
  )
}
