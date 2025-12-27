import { z } from "zod"
import { ThemeColorSet, TypographySettings } from "./theme-presets"

// ============================================================================
// Brand Brief Input Types
// ============================================================================

export const brandPersonalityOptions = [
  "Professional",
  "Playful",
  "Minimalist",
  "Bold",
  "Elegant",
  "Friendly",
  "Innovative",
  "Traditional",
  "Luxurious",
  "Approachable",
  "Trustworthy",
  "Creative",
  "Modern",
  "Classic",
  "Energetic",
] as const

export type BrandPersonality = typeof brandPersonalityOptions[number]

export const brandBriefSchema = z.object({
  businessDescription: z
    .string()
    .min(20, "Please provide at least 20 characters describing your business"),
  targetAudience: z
    .string()
    .min(10, "Please describe your target audience"),
  personality: z
    .array(z.string())
    .min(1, "Select at least one personality trait")
    .max(5, "Select up to 5 personality traits"),
  constraints: z.string().optional(),
  competitors: z.string().optional(),
  existingName: z.string().optional(),
  existingLogoDescription: z.string().optional(),
  sectionsToGenerate: z.object({
    strategy: z.boolean(),
    naming: z.boolean(),
    visual: z.boolean(),
    prompts: z.boolean(),
    tokens: z.boolean(),
  }),
})

export type BrandBriefInput = z.infer<typeof brandBriefSchema>

export const defaultBrandBrief: BrandBriefInput = {
  businessDescription: "",
  targetAudience: "",
  personality: [],
  constraints: "",
  competitors: "",
  existingName: "",
  existingLogoDescription: "",
  sectionsToGenerate: {
    strategy: true,
    naming: true,
    visual: true,
    prompts: true,
    tokens: true,
  },
}

// ============================================================================
// Brand Concept Output Types
// ============================================================================

export interface BrandStrategy {
  purpose: string
  promise: string
  positioning: string
  differentiation: string[]
  messagingPillars: {
    pillar: string
    proofPoints: string[]
  }[]
}

export interface BrandNaming {
  primaryName: string
  nameRationale: string
  alternatives: {
    name: string
    rationale: string
  }[]
  taglineOptions: string[]
  toneOfVoice: {
    description: string
    dos: string[]
    donts: string[]
    examplePhrases: string[]
  }
}

export interface BrandVisual {
  colorPalette: {
    primary: { hex: string; usage: string }
    secondary: { hex: string; usage: string }
    accent: { hex: string; usage: string }
    neutralLight: { hex: string; usage: string }
    neutralDark: { hex: string; usage: string }
    reasoning: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    monoFont?: string
    reasoning: string
  }
  logoDirections: {
    concept: string
    promptText: string
  }[]
  iconographyStyle: string
  illustrationStyle: string
}

export interface BrandPrompts {
  logoPrompt: string
  iconPrompt: string
  heroImagePrompt: string
  socialMediaPrompts: string[]
  photographyStyle: string
}

export interface BrandAppliedExamples {
  homepageHero: {
    headline: string
    subheadline: string
    ctaText: string
  }
  socialPosts: {
    platform: string
    content: string
  }[]
  emailSignature: string
}

export interface BrandTokens {
  colors: {
    light: Partial<ThemeColorSet>
    dark: Partial<ThemeColorSet>
  }
  typography: Partial<TypographySettings>
}

export interface BrandConcept {
  brief: BrandBriefInput
  strategy?: BrandStrategy
  naming?: BrandNaming
  visual?: BrandVisual
  prompts?: BrandPrompts
  appliedExamples?: BrandAppliedExamples
  tokens?: BrandTokens
  generatedAt: string
}

// ============================================================================
// Generation State Types
// ============================================================================

export type WizardStep = "brief" | "review" | "generating" | "complete"

export type GenerationSection = "strategy" | "naming" | "visual" | "prompts" | "tokens"

export interface GenerationProgress {
  currentSection: GenerationSection | null
  completedSections: GenerationSection[]
  progress: number // 0-100
  status: "idle" | "generating" | "success" | "error"
  error?: string
}

// ============================================================================
// API Types
// ============================================================================

export interface GenerateBrandRequest {
  brief: BrandBriefInput
  regenerateSections?: GenerationSection[]
  existingConcept?: BrandConcept
}

export interface GenerateBrandResponse {
  success: boolean
  concept?: BrandConcept
  error?: string
}
