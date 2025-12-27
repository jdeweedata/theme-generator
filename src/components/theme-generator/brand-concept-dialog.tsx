"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  BrandConcept,
  GenerationSection,
} from "@/lib/brand-concept-types"
import {
  generateBrandConceptMarkdown,
  generateBrandPromptsMarkdown,
  generateBrandTokensJson,
  downloadFile,
  copyToClipboard,
  brandConceptToThemePreset,
} from "@/lib/brand-utils"
import { ThemePreset } from "@/lib/theme-presets"
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Palette,
  FileText,
  Sparkles,
  Code,
} from "lucide-react"

interface BrandConceptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  concept: BrandConcept | null
  onApplyTheme: (preset: ThemePreset) => void
  onRegenerate: (section: GenerationSection) => Promise<void>
}

export function BrandConceptDialog({
  open,
  onOpenChange,
  concept,
  onApplyTheme,
  onRegenerate,
}: BrandConceptDialogProps) {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null)
  const [regenerating, setRegenerating] = React.useState<GenerationSection | null>(null)

  if (!concept) return null

  const brandName = concept.naming?.primaryName || concept.brief.existingName || "Brand Concept"

  // Handle copy to clipboard
  const handleCopy = async (content: string, section: string) => {
    const success = await copyToClipboard(content)
    if (success) {
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    }
  }

  // Handle download
  const handleDownload = (type: "concept" | "prompts" | "tokens") => {
    switch (type) {
      case "concept":
        downloadFile(
          generateBrandConceptMarkdown(concept),
          "brand-concept.md",
          "text/markdown"
        )
        break
      case "prompts":
        downloadFile(
          generateBrandPromptsMarkdown(concept),
          "brand-prompts.md",
          "text/markdown"
        )
        break
      case "tokens":
        downloadFile(
          generateBrandTokensJson(concept),
          "brand-tokens.json",
          "application/json"
        )
        break
    }
  }

  // Handle regenerate section
  const handleRegenerate = async (section: GenerationSection) => {
    setRegenerating(section)
    try {
      await onRegenerate(section)
    } finally {
      setRegenerating(null)
    }
  }

  // Handle apply theme
  const handleApplyTheme = () => {
    const preset = brandConceptToThemePreset(concept)
    if (preset) {
      onApplyTheme(preset)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {brandName}
          </DialogTitle>
          <DialogDescription>
            Your AI-generated brand concept is ready. Review, download, or apply to theme.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="concept" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="concept" className="gap-2">
              <FileText className="h-4 w-4" />
              Concept
            </TabsTrigger>
            <TabsTrigger value="prompts" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Prompts
            </TabsTrigger>
            <TabsTrigger value="tokens" className="gap-2">
              <Code className="h-4 w-4" />
              Tokens
            </TabsTrigger>
          </TabsList>

          {/* Concept Tab */}
          <TabsContent value="concept" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(generateBrandConceptMarkdown(concept), "concept")}
              >
                {copiedSection === "concept" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("concept")}>
                <Download className="h-4 w-4 mr-2" />
                Download .md
              </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4">
              <div className="space-y-6">
                {/* Strategy Section */}
                {concept.strategy && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Brand Strategy</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerate("strategy")}
                        disabled={regenerating !== null}
                      >
                        {regenerating === "strategy" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Purpose: </span>
                        {concept.strategy.purpose}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Promise: </span>
                        {concept.strategy.promise}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Positioning: </span>
                        {concept.strategy.positioning}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Differentiators:</span>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {concept.strategy.differentiation.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Separator />
                  </div>
                )}

                {/* Naming Section */}
                {concept.naming && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Naming & Verbal Identity</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerate("naming")}
                        disabled={regenerating !== null}
                      >
                        {regenerating === "naming" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Primary Name: </span>
                        <span className="font-semibold">{concept.naming.primaryName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Rationale: </span>
                        {concept.naming.nameRationale}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Taglines:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {concept.naming.taglineOptions.map((t, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Alternative Names:</span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {concept.naming.alternatives.slice(0, 8).map((alt, i) => (
                            <div key={i} className="p-2 rounded bg-muted/50 text-xs">
                              <div className="font-medium">{alt.name}</div>
                              <div className="text-muted-foreground line-clamp-2">{alt.rationale}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                )}

                {/* Visual Section */}
                {concept.visual && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Visual Identity</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerate("visual")}
                        disabled={regenerating !== null}
                      >
                        {regenerating === "visual" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="space-y-4 text-sm">
                      {/* Color Palette */}
                      <div>
                        <span className="font-medium text-muted-foreground">Color Palette:</span>
                        <div className="flex gap-2 mt-2">
                          {[
                            { name: "Primary", color: concept.visual.colorPalette.primary },
                            { name: "Secondary", color: concept.visual.colorPalette.secondary },
                            { name: "Accent", color: concept.visual.colorPalette.accent },
                            { name: "Light", color: concept.visual.colorPalette.neutralLight },
                            { name: "Dark", color: concept.visual.colorPalette.neutralDark },
                          ].map((c) => (
                            <div key={c.name} className="text-center">
                              <div
                                className="w-12 h-12 rounded-lg border shadow-sm"
                                style={{ backgroundColor: c.color.hex }}
                              />
                              <div className="text-xs mt-1">{c.name}</div>
                              <div className="text-xs text-muted-foreground">{c.color.hex}</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {concept.visual.colorPalette.reasoning}
                        </p>
                      </div>

                      {/* Typography */}
                      <div>
                        <span className="font-medium text-muted-foreground">Typography:</span>
                        <div className="mt-2 space-y-1">
                          <div>Headings: {concept.visual.typography.headingFont}</div>
                          <div>Body: {concept.visual.typography.bodyFont}</div>
                          {concept.visual.typography.monoFont && (
                            <div>Mono: {concept.visual.typography.monoFont}</div>
                          )}
                        </div>
                      </div>

                      {/* Logo Directions */}
                      <div>
                        <span className="font-medium text-muted-foreground">Logo Directions:</span>
                        <div className="grid gap-2 mt-2">
                          {concept.visual.logoDirections.map((dir, i) => (
                            <div key={i} className="p-2 rounded bg-muted/50">
                              <div className="font-medium text-xs">Direction {i + 1}: {dir.concept}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                )}

                {/* Applied Examples Section */}
                {concept.appliedExamples && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Applied Examples</h3>
                    <div className="space-y-4 text-sm">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="font-medium text-muted-foreground mb-2">Homepage Hero</div>
                        <div className="text-lg font-bold">{concept.appliedExamples.homepageHero.headline}</div>
                        <div className="text-muted-foreground">{concept.appliedExamples.homepageHero.subheadline}</div>
                        <Badge className="mt-2">{concept.appliedExamples.homepageHero.ctaText}</Badge>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-2">Social Posts</div>
                        <div className="grid gap-2">
                          {concept.appliedExamples.socialPosts.map((post, i) => (
                            <div key={i} className="p-2 rounded bg-muted/50">
                              <Badge variant="outline" className="text-xs mb-1">{post.platform}</Badge>
                              <p className="text-xs">{post.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(generateBrandPromptsMarkdown(concept), "prompts")}
              >
                {copiedSection === "prompts" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("prompts")}>
                <Download className="h-4 w-4 mr-2" />
                Download .md
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRegenerate("prompts")}
                disabled={regenerating !== null}
              >
                {regenerating === "prompts" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4">
              {concept.prompts ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Logo Generation Prompt</h4>
                    <pre className="p-3 rounded bg-muted text-xs whitespace-pre-wrap font-mono">
                      {concept.prompts.logoPrompt}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Icon Set Prompt</h4>
                    <pre className="p-3 rounded bg-muted text-xs whitespace-pre-wrap font-mono">
                      {concept.prompts.iconPrompt}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Hero Image Prompt</h4>
                    <pre className="p-3 rounded bg-muted text-xs whitespace-pre-wrap font-mono">
                      {concept.prompts.heroImagePrompt}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Social Media Prompts</h4>
                    {concept.prompts.socialMediaPrompts.map((prompt, i) => (
                      <pre key={i} className="p-3 rounded bg-muted text-xs whitespace-pre-wrap font-mono mb-2">
                        {prompt}
                      </pre>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Photography Style</h4>
                    <p className="text-sm text-muted-foreground">{concept.prompts.photographyStyle}</p>
                  </div>

                  {/* Logo directions from visual */}
                  {concept.visual?.logoDirections && (
                    <div>
                      <h4 className="font-medium mb-2">Logo Concept Prompts</h4>
                      {concept.visual.logoDirections.map((dir, i) => (
                        <div key={i} className="mb-3">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Concept {i + 1}: {dir.concept}
                          </div>
                          <pre className="p-3 rounded bg-muted text-xs whitespace-pre-wrap font-mono">
                            {dir.promptText}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>AI prompts were not generated.</p>
                  <p className="text-sm">Enable the &quot;AI Image Prompts&quot; section when generating.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(generateBrandTokensJson(concept), "tokens")}
              >
                {copiedSection === "tokens" ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("tokens")}>
                <Download className="h-4 w-4 mr-2" />
                Download .json
              </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-lg p-4">
              {concept.visual ? (
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {generateBrandTokensJson(concept)}
                </pre>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Design tokens require visual identity.</p>
                  <p className="text-sm">Enable the &quot;Visual Identity&quot; section when generating.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <div className="text-xs text-muted-foreground">
            Generated {new Date(concept.generatedAt).toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {concept.visual && (
              <Button onClick={handleApplyTheme} className="gap-2">
                <Palette className="h-4 w-4" />
                Apply to Theme
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
