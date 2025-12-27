"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TypographySettings, fontOptions, defaultTypography } from "@/lib/theme-presets"
import { ChevronDown, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface TypographyPanelProps {
  typography: TypographySettings
  onTypographyChange: (key: keyof TypographySettings, value: string | number) => void
  onReset: () => void
}

interface TypographySectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function TypographySection({ title, defaultOpen = false, children }: TypographySectionProps) {
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

interface FontSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function FontSelect({ label, value, options, onChange }: FontSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {options.map((font) => (
            <SelectItem key={font} value={font}>
              <span style={{ fontFamily: font }}>{font}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function TypographyPanel({
  typography,
  onTypographyChange,
  onReset,
}: TypographyPanelProps) {
  const hasChanges =
    typography.sansSerifFont !== defaultTypography.sansSerifFont ||
    typography.serifFont !== defaultTypography.serifFont ||
    typography.monospaceFont !== defaultTypography.monospaceFont ||
    typography.letterSpacing !== defaultTypography.letterSpacing

  return (
    <div className="divide-y">
      {/* Reset Button */}
      {hasChanges && (
        <div className="px-4 py-3 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Typography
          </Button>
        </div>
      )}

      {/* Font Family */}
      <TypographySection title="Font Family" defaultOpen>
        <FontSelect
          label="Sans-Serif"
          value={typography.sansSerifFont}
          options={fontOptions.sansSerif}
          onChange={(v) => onTypographyChange("sansSerifFont", v)}
        />
        <FontSelect
          label="Serif"
          value={typography.serifFont}
          options={fontOptions.serif}
          onChange={(v) => onTypographyChange("serifFont", v)}
        />
        <FontSelect
          label="Monospace"
          value={typography.monospaceFont}
          options={fontOptions.monospace}
          onChange={(v) => onTypographyChange("monospaceFont", v)}
        />
      </TypographySection>

      {/* Letter Spacing */}
      <TypographySection title="Letter Spacing" defaultOpen>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Tracking</label>
            <span className="text-xs font-mono text-muted-foreground">
              {typography.letterSpacing.toFixed(2)} em
            </span>
          </div>
          <Slider
            value={[typography.letterSpacing]}
            onValueChange={([value]) => onTypographyChange("letterSpacing", value)}
            min={-0.1}
            max={0.2}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tight</span>
            <span>Normal</span>
            <span>Loose</span>
          </div>
        </div>
      </TypographySection>

      {/* Preview */}
      <TypographySection title="Preview">
        <div className="space-y-4">
          <div className="p-3 rounded-md bg-muted/50">
            <p
              className="text-sm"
              style={{
                fontFamily: typography.sansSerifFont,
                letterSpacing: `${typography.letterSpacing}em`,
              }}
            >
              Sans-serif: The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <p
              className="text-sm"
              style={{
                fontFamily: typography.serifFont,
                letterSpacing: `${typography.letterSpacing}em`,
              }}
            >
              Serif: The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div className="p-3 rounded-md bg-muted/50">
            <p
              className="text-sm font-mono"
              style={{
                fontFamily: typography.monospaceFont,
                letterSpacing: `${typography.letterSpacing}em`,
              }}
            >
              Monospace: const hello = &quot;world&quot;;
            </p>
          </div>
        </div>
      </TypographySection>
    </div>
  )
}
