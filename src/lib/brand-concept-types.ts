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

// ============================================================================
// AI Engine Configuration Types
// ============================================================================

export const strategyEngineOptions = [
  { value: "claude-opus", label: "Claude Opus 4.5 (Recommended)" },
  { value: "gpt-4o", label: "GPT-4o" },
] as const

export const visualEngineOptions = [
  { value: "gemini-imagen", label: "Gemini 3 Pro + Imagen 4 (Recommended)" },
  { value: "dall-e-3", label: "DALL-E 3" },
] as const

export type StrategyEngine = typeof strategyEngineOptions[number]["value"]
export type VisualEngine = typeof visualEngineOptions[number]["value"]

export interface UserApiKeys {
  anthropic?: string
  openai?: string
  google?: string
}

export interface EngineConfig {
  strategyEngine: StrategyEngine
  visualEngine: VisualEngine
  userKeys: UserApiKeys
}

export const defaultEngineConfig: EngineConfig = {
  strategyEngine: "claude-opus",
  visualEngine: "gemini-imagen",
  userKeys: {},
}

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
// Brand Concept Output Types (with Zod validation schemas)
// ============================================================================

// Zod schemas for validating AI responses
export const brandStrategySchema = z.object({
  purpose: z.string(),
  promise: z.string(),
  positioning: z.string(),
  differentiation: z.array(z.string()),
  messagingPillars: z.array(
    z.object({
      pillar: z.string(),
      proofPoints: z.array(z.string()),
    })
  ),
})

export const brandNamingSchema = z.object({
  primaryName: z.string(),
  nameRationale: z.string(),
  alternatives: z.array(
    z.object({
      name: z.string(),
      rationale: z.string(),
    })
  ),
  taglineOptions: z.array(z.string()),
  toneOfVoice: z.object({
    description: z.string(),
    dos: z.array(z.string()),
    donts: z.array(z.string()),
    examplePhrases: z.array(z.string()),
  }),
})

export const brandVisualSchema = z.object({
  colorPalette: z.object({
    primary: z.object({ hex: z.string(), usage: z.string() }),
    secondary: z.object({ hex: z.string(), usage: z.string() }),
    accent: z.object({ hex: z.string(), usage: z.string() }),
    neutralLight: z.object({ hex: z.string(), usage: z.string() }),
    neutralDark: z.object({ hex: z.string(), usage: z.string() }),
    reasoning: z.string(),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    monoFont: z.string().optional(),
    reasoning: z.string(),
  }),
  logoDirections: z.array(
    z.object({
      concept: z.string(),
      promptText: z.string(),
    })
  ),
  iconographyStyle: z.string(),
  illustrationStyle: z.string(),
})

export const brandPromptsSchema = z.object({
  logoPrompt: z.string(),
  iconPrompt: z.string(),
  heroImagePrompt: z.string(),
  socialMediaPrompts: z.array(z.string()),
  photographyStyle: z.string(),
})

export const brandAppliedExamplesSchema = z.object({
  homepageHero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    ctaText: z.string(),
  }),
  socialPosts: z.array(
    z.object({
      platform: z.string(),
      content: z.string(),
    })
  ),
  emailSignature: z.string(),
})

// TypeScript interfaces (derived from schemas)
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
