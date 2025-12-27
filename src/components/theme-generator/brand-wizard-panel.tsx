"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BrandBriefInput,
  BrandConcept,
  WizardStep,
  GenerationSection,
  brandPersonalityOptions,
  defaultBrandBrief,
} from "@/lib/brand-concept-types"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pencil,
  ChevronDown,
  ChevronRight,
  Key,
} from "lucide-react"

interface BrandWizardPanelProps {
  onComplete: (concept: BrandConcept, apiKey?: string) => void
  onError: (error: string) => void
}

export function BrandWizardPanel({ onComplete, onError }: BrandWizardPanelProps) {
  const [step, setStep] = React.useState<WizardStep>("brief")
  const [brief, setBrief] = React.useState<BrandBriefInput>(defaultBrandBrief)
  const [progress, setProgress] = React.useState(0)
  const [currentSection, setCurrentSection] = React.useState<string>("")
  const [errors, setErrors] = React.useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [customApiKey, setCustomApiKey] = React.useState("")

  // Refs for interval cleanup on unmount
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const sectionIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // Cleanup intervals on unmount
  React.useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (sectionIntervalRef.current) clearInterval(sectionIntervalRef.current)
    }
  }, [])

  // Form validation
  const validateBrief = (): boolean => {
    const newErrors: string[] = []

    if (brief.businessDescription.length < 20) {
      newErrors.push("Please provide at least 20 characters for business description")
    }
    if (brief.targetAudience.length < 10) {
      newErrors.push("Please describe your target audience")
    }
    if (brief.personality.length === 0) {
      newErrors.push("Select at least one personality trait")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle brief form submission
  const handleBriefSubmit = () => {
    if (validateBrief()) {
      setStep("review")
    }
  }

  // Handle generation
  const handleGenerate = async () => {
    setStep("generating")
    setProgress(0)
    setCurrentSection("Initializing...")

    // Get selected sections
    const sections: GenerationSection[] = []
    if (brief.sectionsToGenerate.strategy) sections.push("strategy")
    if (brief.sectionsToGenerate.naming) sections.push("naming")
    if (brief.sectionsToGenerate.visual) sections.push("visual")
    if (brief.sectionsToGenerate.prompts) sections.push("prompts")
    if (brief.sectionsToGenerate.tokens) sections.push("tokens")

    // Simulate progress updates - store in refs for cleanup on unmount
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90))
    }, 1000)

    const sectionNames = ["Strategy", "Naming", "Visual Identity", "AI Prompts", "Design Tokens"]
    let sectionIndex = 0
    sectionIntervalRef.current = setInterval(() => {
      if (sectionIndex < sectionNames.length) {
        setCurrentSection(`Generating ${sectionNames[sectionIndex]}...`)
        sectionIndex++
      }
    }, 3000)

    // Helper to clear intervals
    const clearIntervals = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (sectionIntervalRef.current) {
        clearInterval(sectionIntervalRef.current)
        sectionIntervalRef.current = null
      }
    }

    try {
      const response = await fetch("/api/brand-concept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass custom API key in header if provided
          ...(customApiKey.trim() && { "X-OpenAI-Key": customApiKey.trim() }),
        },
        body: JSON.stringify({
          brief,
          sections,
        }),
      })

      // Clear intervals immediately after fetch completes (before parsing)
      clearIntervals()

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate brand concept")
      }

      setProgress(100)
      setCurrentSection("Complete!")
      setStep("complete")
      onComplete(data.concept, customApiKey.trim() || undefined)
    } catch (error) {
      clearIntervals()
      setStep("review")
      onError(error instanceof Error ? error.message : "Generation failed")
    }
  }

  // Toggle personality trait
  const togglePersonality = (trait: string) => {
    setBrief((prev) => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter((p) => p !== trait)
        : prev.personality.length < 5
        ? [...prev.personality, trait]
        : prev.personality,
    }))
  }

  // Toggle section to generate
  const toggleSection = (section: keyof typeof brief.sectionsToGenerate) => {
    setBrief((prev) => ({
      ...prev,
      sectionsToGenerate: {
        ...prev.sectionsToGenerate,
        [section]: !prev.sectionsToGenerate[section],
      },
    }))
  }

  // Render Brief Step
  const renderBriefStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">Brand Brief</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your business to generate a complete brand concept
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="text-sm text-destructive">
              {errors.map((error, i) => (
                <div key={i}>{error}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Business Description */}
      <div className="space-y-2">
        <Label htmlFor="businessDescription">
          Business Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="businessDescription"
          placeholder="Describe what your business does, your products/services, and what makes you unique..."
          value={brief.businessDescription}
          onChange={(e) =>
            setBrief((prev) => ({ ...prev, businessDescription: e.target.value }))
          }
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          {brief.businessDescription.length}/20 characters minimum
        </p>
      </div>

      {/* Target Audience */}
      <div className="space-y-2">
        <Label htmlFor="targetAudience">
          Target Audience <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="targetAudience"
          placeholder="Who are your ideal customers? Include demographics, interests, pain points..."
          value={brief.targetAudience}
          onChange={(e) =>
            setBrief((prev) => ({ ...prev, targetAudience: e.target.value }))
          }
          className="min-h-[80px]"
        />
      </div>

      {/* Brand Personality */}
      <div className="space-y-2">
        <Label>
          Brand Personality <span className="text-destructive">*</span>
          <span className="text-xs text-muted-foreground ml-2">
            ({brief.personality.length}/5 selected)
          </span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {brandPersonalityOptions.map((trait) => (
            <Badge
              key={trait}
              variant={brief.personality.includes(trait) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => togglePersonality(trait)}
            >
              {trait}
            </Badge>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="space-y-2">
        <Label htmlFor="constraints">Constraints (Optional)</Label>
        <Textarea
          id="constraints"
          placeholder="Any colors to avoid, name restrictions, domain constraints, language/tone requirements..."
          value={brief.constraints}
          onChange={(e) =>
            setBrief((prev) => ({ ...prev, constraints: e.target.value }))
          }
          className="min-h-[60px]"
        />
      </div>

      {/* Competitors */}
      <div className="space-y-2">
        <Label htmlFor="competitors">Competitors / Reference Brands (Optional)</Label>
        <Textarea
          id="competitors"
          placeholder="List competitors or brands you admire for reference..."
          value={brief.competitors}
          onChange={(e) =>
            setBrief((prev) => ({ ...prev, competitors: e.target.value }))
          }
          className="min-h-[60px]"
        />
      </div>

      {/* Existing Name */}
      <div className="space-y-2">
        <Label htmlFor="existingName">Existing Brand Name (Optional)</Label>
        <Input
          id="existingName"
          placeholder="Keep an existing name if you have one"
          value={brief.existingName}
          onChange={(e) =>
            setBrief((prev) => ({ ...prev, existingName: e.target.value }))
          }
        />
      </div>

      {/* Existing Logo */}
      <div className="space-y-2">
        <Label htmlFor="existingLogoDescription">Existing Logo Description (Optional)</Label>
        <Textarea
          id="existingLogoDescription"
          placeholder="Describe your existing logo if you want to keep visual elements..."
          value={brief.existingLogoDescription}
          onChange={(e) =>
            setBrief((prev) => ({ ...prev, existingLogoDescription: e.target.value }))
          }
          className="min-h-[60px]"
        />
      </div>

      {/* Advanced Toggle */}
      <div className="border rounded-lg">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Advanced
          </span>
          {showAdvanced ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {showAdvanced && (
          <div className="px-3 pb-3 space-y-2">
            <Label htmlFor="customApiKey" className="text-xs">
              OpenAI API Key (Optional)
            </Label>
            <Input
              id="customApiKey"
              type="password"
              placeholder="sk-..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Use your own OpenAI API key to hit your own account. Leave empty to use the default.
            </p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <Button onClick={handleBriefSubmit} className="w-full gap-2">
        Continue to Review
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )

  // Render Review Step
  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b">
        <h3 className="font-semibold text-lg">Review & Generate</h3>
        <p className="text-sm text-muted-foreground">
          Review your brief and select what to generate
        </p>
      </div>

      {/* Brief Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Your Brief</h4>
          <Button variant="ghost" size="sm" onClick={() => setStep("brief")}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="font-medium text-muted-foreground mb-1">Business</div>
            <div className="line-clamp-2">{brief.businessDescription}</div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="font-medium text-muted-foreground mb-1">Audience</div>
            <div className="line-clamp-2">{brief.targetAudience}</div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="font-medium text-muted-foreground mb-1">Personality</div>
            <div className="flex flex-wrap gap-1">
              {brief.personality.map((trait) => (
                <Badge key={trait} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          {brief.existingName && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="font-medium text-muted-foreground mb-1">Existing Name</div>
              <div>{brief.existingName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Section Selection */}
      <div className="space-y-4">
        <h4 className="font-medium">Sections to Generate</h4>
        <div className="space-y-3">
          {[
            {
              key: "strategy" as const,
              label: "Brand Strategy",
              description: "Purpose, positioning, messaging pillars",
            },
            {
              key: "naming" as const,
              label: "Naming & Verbal Identity",
              description: "Name suggestions, taglines, tone of voice",
            },
            {
              key: "visual" as const,
              label: "Visual Identity",
              description: "Colors, typography, logo directions",
            },
            {
              key: "prompts" as const,
              label: "AI Image Prompts",
              description: "Ready-to-use prompts for image tools",
            },
            {
              key: "tokens" as const,
              label: "Design Tokens",
              description: "CSS variables for your design system",
            },
          ].map((section) => (
            <div
              key={section.key}
              className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
              onClick={() => toggleSection(section.key)}
            >
              <Checkbox
                checked={brief.sectionsToGenerate[section.key]}
                onCheckedChange={() => toggleSection(section.key)}
              />
              <div className="flex-1">
                <div className="font-medium text-sm">{section.label}</div>
                <div className="text-xs text-muted-foreground">
                  {section.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep("brief")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleGenerate}
          className="flex-1 gap-2"
          disabled={!Object.values(brief.sectionsToGenerate).some(Boolean)}
        >
          <Sparkles className="h-4 w-4" />
          Generate Brand Concept
        </Button>
      </div>
    </div>
  )

  // Render Generating Step
  const renderGeneratingStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">Generating Your Brand</h3>
        <p className="text-sm text-muted-foreground">{currentSection}</p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">{progress}% complete</p>
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-sm">
        This may take 30-60 seconds. We&apos;re using AI to craft a comprehensive brand
        concept tailored to your brief.
      </p>
    </div>
  )

  // Render Complete Step
  const renderCompleteStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">Brand Concept Generated!</h3>
        <p className="text-sm text-muted-foreground">
          Your complete brand concept is ready. Click below to view the results.
        </p>
      </div>
    </div>
  )

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {step === "brief" && renderBriefStep()}
        {step === "review" && renderReviewStep()}
        {step === "generating" && renderGeneratingStep()}
        {step === "complete" && renderCompleteStep()}
      </div>
    </ScrollArea>
  )
}
