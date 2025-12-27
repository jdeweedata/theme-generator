"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemePreset, ThemeColorSet } from "@/lib/theme-presets"
import { Check, Copy, X } from "lucide-react"

interface CodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preset: ThemePreset
  customColors: {
    light: Partial<ThemeColorSet>
    dark: Partial<ThemeColorSet>
  }
  isDarkMode: boolean
}

const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const
type PackageManager = typeof packageManagers[number]

export function CodeDialog({
  open,
  onOpenChange,
  preset,
  customColors,
}: CodeDialogProps) {
  const [activeManager, setActiveManager] = React.useState<PackageManager>("pnpm")
  const [tailwindVersion, setTailwindVersion] = React.useState<"v4" | "v3">("v4")
  const [colorFormat, setColorFormat] = React.useState<"oklch" | "hsl">("oklch")
  const [copied, setCopied] = React.useState(false)

  // Generate CSS content
  const generateCSS = React.useCallback(() => {
    const lightColors = { ...preset.colors.light, ...customColors.light }
    const darkColors = { ...preset.colors.dark, ...customColors.dark }

    const formatColor = (hsl: string) => {
      if (colorFormat === "hsl") {
        return `hsl(${hsl})`
      }
      // Convert HSL to OKLCH (simplified approximation)
      const match = hsl.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/)
      if (!match) return hsl
      const h = parseFloat(match[1])
      const s = parseFloat(match[2]) / 100
      const l = parseFloat(match[3]) / 100
      // Simplified OKLCH approximation
      const L = l
      const C = s * 0.4 * (1 - Math.abs(2 * l - 1))
      return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(4)})`
    }

    const formatVar = (key: string, value: string) => {
      const varName = key.replace(/([A-Z])/g, "-$1").toLowerCase()
      if (varName === "radius") return `    --${varName}: ${value};`
      return `    --${varName}: ${formatColor(value)};`
    }

    const rootVars = Object.entries(lightColors)
      .map(([key, value]) => formatVar(key, value))
      .join("\n")

    const darkVars = Object.entries(darkColors)
      .map(([key, value]) => formatVar(key, value))
      .join("\n")

    return `:root {
${rootVars}
  }

  .dark {
${darkVars}
  }`
  }, [preset, customColors, colorFormat])

  const cssContent = generateCSS()

  const installCommand = `${activeManager} dlx shadcn@latest add https://tweakcn.com/r/themes/${preset.name.toLowerCase().replace(/\s+/g, "-")}.json`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Theme Code</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Package manager tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
            {packageManagers.map((pm) => (
              <button
                key={pm}
                onClick={() => setActiveManager(pm)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeManager === pm
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {pm}
              </button>
            ))}
          </div>

          {/* Install command */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
            <span className="flex-1 truncate">{installCommand}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Format options */}
          <div className="flex gap-4">
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {(["v4", "v3"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setTailwindVersion(v)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    tailwindVersion === v
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tailwind {v}
                </button>
              ))}
            </div>

            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {(["oklch", "hsl"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setColorFormat(f)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    colorFormat === f
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* CSS output */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">index.css</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              <pre className="p-4 text-sm font-mono">
                <code>{cssContent}</code>
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
