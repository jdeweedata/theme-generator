"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeColorSet } from "@/lib/theme-presets"
import { ChevronDown, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { hslToHex, hexToHslString, parseHslString } from "@/lib/color-utils"

interface ColorPanelProps {
  colors: ThemeColorSet
  isDarkMode: boolean
  onColorChange: (key: keyof ThemeColorSet, value: string) => void
}

interface ColorSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function ColorSection({ title, defaultOpen = false, children }: ColorSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  )
}

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  // Parse HSL string to get individual values
  const parsed = parseHslString(value)
  const h = parsed?.h ?? 0
  const s = parsed?.s ?? 0
  const l = parsed?.l ?? 50

  const hexValue = hslToHex(h, s, l)
  const [inputValue, setInputValue] = React.useState(hexValue)

  React.useEffect(() => {
    setInputValue(hslToHex(h, s, l))
  }, [h, s, l])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(hexToHslString(newValue))
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-md border shadow-sm flex-shrink-0"
          style={{ backgroundColor: `hsl(${value})` }}
        />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
        <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ColorPanel({ colors, isDarkMode: _isDarkMode, onColorChange }: ColorPanelProps) {
  return (
    <div className="divide-y">
      {/* Primary Colors */}
      <ColorSection title="Primary Colors" defaultOpen>
        <ColorInput
          label="Primary"
          value={colors.primary}
          onChange={(v) => onColorChange("primary", v)}
        />
        <ColorInput
          label="Primary Foreground"
          value={colors.primaryForeground}
          onChange={(v) => onColorChange("primaryForeground", v)}
        />
      </ColorSection>

      {/* Secondary Colors */}
      <ColorSection title="Secondary Colors">
        <ColorInput
          label="Secondary"
          value={colors.secondary}
          onChange={(v) => onColorChange("secondary", v)}
        />
        <ColorInput
          label="Secondary Foreground"
          value={colors.secondaryForeground}
          onChange={(v) => onColorChange("secondaryForeground", v)}
        />
      </ColorSection>

      {/* Accent Colors */}
      <ColorSection title="Accent Colors">
        <ColorInput
          label="Accent"
          value={colors.accent}
          onChange={(v) => onColorChange("accent", v)}
        />
        <ColorInput
          label="Accent Foreground"
          value={colors.accentForeground}
          onChange={(v) => onColorChange("accentForeground", v)}
        />
      </ColorSection>

      {/* Base Colors */}
      <ColorSection title="Base Colors">
        <ColorInput
          label="Background"
          value={colors.background}
          onChange={(v) => onColorChange("background", v)}
        />
        <ColorInput
          label="Foreground"
          value={colors.foreground}
          onChange={(v) => onColorChange("foreground", v)}
        />
      </ColorSection>

      {/* Card Colors */}
      <ColorSection title="Card Colors">
        <ColorInput
          label="Card"
          value={colors.card}
          onChange={(v) => onColorChange("card", v)}
        />
        <ColorInput
          label="Card Foreground"
          value={colors.cardForeground}
          onChange={(v) => onColorChange("cardForeground", v)}
        />
      </ColorSection>

      {/* Popover Colors */}
      <ColorSection title="Popover Colors">
        <ColorInput
          label="Popover"
          value={colors.popover}
          onChange={(v) => onColorChange("popover", v)}
        />
        <ColorInput
          label="Popover Foreground"
          value={colors.popoverForeground}
          onChange={(v) => onColorChange("popoverForeground", v)}
        />
      </ColorSection>

      {/* Muted Colors */}
      <ColorSection title="Muted Colors">
        <ColorInput
          label="Muted"
          value={colors.muted}
          onChange={(v) => onColorChange("muted", v)}
        />
        <ColorInput
          label="Muted Foreground"
          value={colors.mutedForeground}
          onChange={(v) => onColorChange("mutedForeground", v)}
        />
      </ColorSection>

      {/* Destructive Colors */}
      <ColorSection title="Destructive Colors">
        <ColorInput
          label="Destructive"
          value={colors.destructive}
          onChange={(v) => onColorChange("destructive", v)}
        />
        <ColorInput
          label="Destructive Foreground"
          value={colors.destructiveForeground}
          onChange={(v) => onColorChange("destructiveForeground", v)}
        />
      </ColorSection>

      {/* Border & Input Colors */}
      <ColorSection title="Border & Input Colors">
        <ColorInput
          label="Border"
          value={colors.border}
          onChange={(v) => onColorChange("border", v)}
        />
        <ColorInput
          label="Input"
          value={colors.input}
          onChange={(v) => onColorChange("input", v)}
        />
        <ColorInput
          label="Ring"
          value={colors.ring}
          onChange={(v) => onColorChange("ring", v)}
        />
      </ColorSection>

      {/* Chart Colors */}
      <ColorSection title="Chart Colors">
        <ColorInput
          label="Chart 1"
          value={colors.chart1}
          onChange={(v) => onColorChange("chart1", v)}
        />
        <ColorInput
          label="Chart 2"
          value={colors.chart2}
          onChange={(v) => onColorChange("chart2", v)}
        />
        <ColorInput
          label="Chart 3"
          value={colors.chart3}
          onChange={(v) => onColorChange("chart3", v)}
        />
        <ColorInput
          label="Chart 4"
          value={colors.chart4}
          onChange={(v) => onColorChange("chart4", v)}
        />
        <ColorInput
          label="Chart 5"
          value={colors.chart5}
          onChange={(v) => onColorChange("chart5", v)}
        />
      </ColorSection>
    </div>
  )
}
