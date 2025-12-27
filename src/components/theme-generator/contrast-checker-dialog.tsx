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
import { ThemeColorSet } from "@/lib/theme-presets"
import {
  getContrastRatio,
  hslToHex,
  ContrastPair,
  ContrastSection,
} from "@/lib/contrast-utils"
import { X, Check, AlertTriangle, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContrastCheckerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colors: ThemeColorSet
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

interface ContrastCardProps {
  pair: ContrastPair
}

function ContrastCard({ pair }: ContrastCardProps) {
  const ratio = pair.ratio ?? 0
  const passes = pair.passes ?? false

  return (
    <div
      className={cn(
        "border rounded-lg p-4",
        !passes && "border-destructive/50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "font-medium text-sm",
            !passes && "text-destructive flex items-center gap-1"
          )}
        >
          {pair.name}
          {!passes && <AlertTriangle className="h-3 w-3" />}
        </span>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
            passes
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}
        >
          {passes ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {ratio.toFixed(2)}
        </span>
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Color info */}
        <div className="space-y-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: `hsl(${pair.background})` }}
            />
            <div className="text-xs">
              <div className="text-muted-foreground">Background</div>
              <div className="font-mono">{pair.backgroundHex}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: `hsl(${pair.foreground})` }}
            />
            <div className="text-xs">
              <div className="text-muted-foreground">Foreground</div>
              <div className="font-mono">{pair.foregroundHex}</div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div
          className="flex-1 rounded-lg flex flex-col items-center justify-center py-3 border"
          style={{ backgroundColor: `hsl(${pair.background})` }}
        >
          <span
            className="text-3xl font-semibold"
            style={{ color: `hsl(${pair.foreground})` }}
          >
            Aa
          </span>
          <span
            className="text-sm"
            style={{ color: `hsl(${pair.foreground})` }}
          >
            Sample Text
          </span>
        </div>
      </div>
    </div>
  )
}

export function ContrastCheckerDialog({
  open,
  onOpenChange,
  colors,
  isDarkMode,
  onToggleDarkMode,
}: ContrastCheckerDialogProps) {
  const [filter, setFilter] = React.useState<"all" | "issues">("all")

  // Build contrast pairs from colors
  const buildContrastSections = React.useCallback((): ContrastSection[] => {
    const createPair = (
      name: string,
      background: string,
      foreground: string
    ): ContrastPair => {
      const ratio = getContrastRatio(background, foreground)
      return {
        name,
        background,
        foreground,
        backgroundHex: hslToHex(background),
        foregroundHex: hslToHex(foreground),
        ratio,
        passes: ratio >= 4.5,
      }
    }

    return [
      {
        title: "Content & Containers",
        pairs: [
          createPair("Base", colors.background, colors.foreground),
          createPair("Card", colors.card, colors.cardForeground),
          createPair("Popover", colors.popover, colors.popoverForeground),
          createPair("Muted", colors.muted, colors.mutedForeground),
        ],
      },
      {
        title: "Interactive Elements",
        pairs: [
          createPair("Primary", colors.primary, colors.primaryForeground),
          createPair("Secondary", colors.secondary, colors.secondaryForeground),
          createPair("Accent", colors.accent, colors.accentForeground),
        ],
      },
      {
        title: "Navigation & Functional",
        pairs: [
          createPair("Destructive", colors.destructive, colors.destructiveForeground),
          createPair("Border on Background", colors.background, colors.border),
          createPair("Input on Background", colors.background, colors.input),
        ],
      },
    ]
  }, [colors])

  const sections = buildContrastSections()

  // Count issues
  const issueCount = sections.reduce(
    (count, section) =>
      count + section.pairs.filter((p) => !p.passes).length,
    0
  )

  // Filter sections based on current filter
  const filteredSections = React.useMemo(() => {
    if (filter === "all") return sections
    return sections
      .map((section) => ({
        ...section,
        pairs: section.pairs.filter((p) => !p.passes),
      }))
      .filter((section) => section.pairs.length > 0)
  }, [sections, filter])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Contrast Checker</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                WCAG 2.0 AA requires a contrast ratio of at least 4.5:1 •{" "}
                <a
                  href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn more
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleDarkMode}
              >
                {isDarkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              {/* Filter tabs */}
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors",
                    filter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("issues")}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1",
                    filter === "issues"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Issues ({issueCount})
                </button>
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {filteredSections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>All color pairs pass WCAG 2.0 AA contrast requirements!</p>
              </div>
            ) : (
              filteredSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-medium mb-3">{section.title}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {section.pairs.map((pair) => (
                      <ContrastCard key={pair.name} pair={pair} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
