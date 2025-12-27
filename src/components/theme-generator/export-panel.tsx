"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeColors, generateFullCSS } from "@/lib/theme-utils"
import { Check, Copy, Download } from "lucide-react"

interface ExportPanelProps {
  lightColors: ThemeColors
  darkColors: ThemeColors
}

export function ExportPanel({ lightColors, darkColors }: ExportPanelProps) {
  const [copied, setCopied] = React.useState(false)
  const cssOutput = generateFullCSS(lightColors, darkColors)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssOutput)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([cssOutput], { type: "text/css" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "theme.css"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-sm font-semibold">CSS Variables Export</h3>
        <div className="flex gap-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
            {cssOutput}
          </pre>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground">
          Copy this CSS and paste it into your <code className="bg-background px-1 rounded">globals.css</code> file
          to apply these theme colors to your project.
        </p>
      </div>
    </div>
  )
}
