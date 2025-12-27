import { BrandBriefInput, GenerationSection } from "./brand-concept-types"
import { sanitizeBrandBrief } from "./prompt-sanitizer"

// ============================================================================
// System Prompts for Brand Generation
// ============================================================================

export const BRAND_GENERATION_SYSTEM_PROMPT = `You are an expert brand strategist, naming specialist, and visual identity designer with 20+ years of experience working with startups and established companies.

Your task is to generate comprehensive brand concepts based on user briefs. You create professional, actionable brand systems that include strategy, naming, visual direction, and implementation guidance.

Key principles:
- Be specific and actionable, not generic
- Provide reasoning for every recommendation
- Consider the target audience in all decisions
- Ensure visual elements work together cohesively
- Make naming suggestions memorable and unique
- Consider practical implementation (web, mobile, print)

Output format: Always respond with valid JSON matching the requested structure.`

// ============================================================================
// Section-Specific Prompts
// ============================================================================

export function getStrategyPrompt(brief: BrandBriefInput): string {
  const safeBrief = sanitizeBrandBrief(brief)
  return `Generate a brand strategy for this business:

BUSINESS DESCRIPTION:
${safeBrief.businessDescription}

TARGET AUDIENCE:
${safeBrief.targetAudience}

BRAND PERSONALITY:
${safeBrief.personality.join(", ")}

${safeBrief.constraints ? `CONSTRAINTS:\n${safeBrief.constraints}` : ""}
${safeBrief.competitors ? `COMPETITORS/REFERENCES:\n${safeBrief.competitors}` : ""}
${safeBrief.existingName ? `EXISTING BRAND NAME: ${safeBrief.existingName}` : ""}

Generate a brand strategy with:
1. Brand purpose (why the brand exists beyond profit)
2. Brand promise (what customers can expect)
3. Positioning statement (how the brand is positioned in the market)
4. 3-5 key differentiators
5. 3-5 messaging pillars, each with 2-3 proof points

Respond with JSON in this exact format:
{
  "purpose": "string",
  "promise": "string",
  "positioning": "string",
  "differentiation": ["string", "string", "string"],
  "messagingPillars": [
    {
      "pillar": "string",
      "proofPoints": ["string", "string"]
    }
  ]
}`
}

export function getNamingPrompt(brief: BrandBriefInput): string {
  const safeBrief = sanitizeBrandBrief(brief)
  return `Generate naming and verbal identity for this business:

BUSINESS DESCRIPTION:
${safeBrief.businessDescription}

TARGET AUDIENCE:
${safeBrief.targetAudience}

BRAND PERSONALITY:
${safeBrief.personality.join(", ")}

${safeBrief.constraints ? `CONSTRAINTS:\n${safeBrief.constraints}` : ""}
${safeBrief.existingName ? `EXISTING BRAND NAME TO KEEP: ${safeBrief.existingName}` : "Generate 10-15 name candidates."}

Generate:
1. Primary name recommendation (${safeBrief.existingName ? "use the existing name" : "your top pick"}) with rationale
2. ${safeBrief.existingName ? "5 alternative names if they want to rebrand" : "10-15 alternative name options"} with brief rationale for each
3. 5 tagline options that work with the primary name
4. Tone of voice guide with description, dos, don'ts, and example phrases

Respond with JSON in this exact format:
{
  "primaryName": "string",
  "nameRationale": "string explaining why this name works",
  "alternatives": [
    {
      "name": "string",
      "rationale": "string"
    }
  ],
  "taglineOptions": ["string", "string", "string", "string", "string"],
  "toneOfVoice": {
    "description": "2-3 sentence description of the brand voice",
    "dos": ["string", "string", "string"],
    "donts": ["string", "string", "string"],
    "examplePhrases": ["string", "string", "string"]
  }
}`
}

export function getVisualPrompt(brief: BrandBriefInput, brandName?: string): string {
  const safeBrief = sanitizeBrandBrief(brief)
  return `Generate visual identity specifications for this brand:

BRAND NAME: ${brandName || safeBrief.existingName || "TBD"}

BUSINESS DESCRIPTION:
${safeBrief.businessDescription}

TARGET AUDIENCE:
${safeBrief.targetAudience}

BRAND PERSONALITY:
${safeBrief.personality.join(", ")}

${safeBrief.constraints ? `CONSTRAINTS:\n${safeBrief.constraints}` : ""}
${safeBrief.existingLogoDescription ? `EXISTING LOGO DESCRIPTION:\n${safeBrief.existingLogoDescription}` : ""}

Generate:
1. Color palette with 5 colors (primary, secondary, accent, neutral light, neutral dark)
   - Each with hex code and usage notes
   - Include reasoning for the palette choices
2. Typography recommendations (heading font, body font, optional monospace)
   - Use Google Fonts that are web-safe
   - Include reasoning
3. 3 logo direction concepts with AI-ready prompts for image generation tools
4. Iconography style description
5. Illustration style description

Respond with JSON in this exact format:
{
  "colorPalette": {
    "primary": { "hex": "#XXXXXX", "usage": "string" },
    "secondary": { "hex": "#XXXXXX", "usage": "string" },
    "accent": { "hex": "#XXXXXX", "usage": "string" },
    "neutralLight": { "hex": "#XXXXXX", "usage": "string" },
    "neutralDark": { "hex": "#XXXXXX", "usage": "string" },
    "reasoning": "string explaining color choices"
  },
  "typography": {
    "headingFont": "Google Font Name",
    "bodyFont": "Google Font Name",
    "monoFont": "Google Font Name or null",
    "reasoning": "string explaining typography choices"
  },
  "logoDirections": [
    {
      "concept": "Brief concept description",
      "promptText": "Detailed AI image generation prompt"
    }
  ],
  "iconographyStyle": "string describing icon style",
  "illustrationStyle": "string describing illustration style"
}`
}

export function getPromptsPrompt(brief: BrandBriefInput, brandName?: string, visual?: string): string {
  const safeBrief = sanitizeBrandBrief(brief)
  return `Generate AI image generation prompts for this brand:

BRAND NAME: ${brandName || safeBrief.existingName || "TBD"}

BUSINESS DESCRIPTION:
${safeBrief.businessDescription}

BRAND PERSONALITY:
${safeBrief.personality.join(", ")}

${visual ? `VISUAL IDENTITY CONTEXT:\n${visual}` : ""}

Generate ready-to-use prompts for AI image tools (Midjourney, DALL-E, etc.):
1. Logo generation prompt (detailed, professional)
2. Icon set generation prompt
3. Hero image prompt for website
4. 3 social media graphic prompts
5. Photography style guide description

Respond with JSON in this exact format:
{
  "logoPrompt": "detailed prompt string",
  "iconPrompt": "detailed prompt string",
  "heroImagePrompt": "detailed prompt string",
  "socialMediaPrompts": ["prompt 1", "prompt 2", "prompt 3"],
  "photographyStyle": "description of photography style to use"
}`
}

export function getAppliedExamplesPrompt(brief: BrandBriefInput, brandName?: string, strategy?: string, naming?: string): string {
  const safeBrief = sanitizeBrandBrief(brief)
  return `Generate applied brand examples for this brand:

BRAND NAME: ${brandName || safeBrief.existingName || "TBD"}

BUSINESS DESCRIPTION:
${safeBrief.businessDescription}

TARGET AUDIENCE:
${safeBrief.targetAudience}

${strategy ? `BRAND STRATEGY CONTEXT:\n${strategy}` : ""}
${naming ? `VERBAL IDENTITY CONTEXT:\n${naming}` : ""}

Generate real-world examples:
1. Homepage hero section (headline, subheadline, CTA text)
2. 3 social media posts (specify platform and content)
3. Professional email signature template

Respond with JSON in this exact format:
{
  "homepageHero": {
    "headline": "string",
    "subheadline": "string",
    "ctaText": "string"
  },
  "socialPosts": [
    {
      "platform": "Twitter/X",
      "content": "string"
    },
    {
      "platform": "LinkedIn",
      "content": "string"
    },
    {
      "platform": "Instagram",
      "content": "string"
    }
  ],
  "emailSignature": "multi-line string with signature format"
}`
}

// ============================================================================
// Combined Generation Prompt
// ============================================================================

export function getFullBrandPrompt(brief: BrandBriefInput, sections: GenerationSection[]): string {
  const safeBrief = sanitizeBrandBrief(brief)
  const sectionDescriptions: Record<GenerationSection, string> = {
    strategy: "Brand strategy (purpose, promise, positioning, differentiators, messaging pillars)",
    naming: "Naming & verbal identity (name candidates, taglines, tone of voice)",
    visual: "Visual identity (color palette, typography, logo directions, iconography)",
    prompts: "AI image prompts (logo, icons, hero image, social media)",
    tokens: "Design tokens are generated from visual identity - include visual section",
  }

  const requestedSections = sections
    .filter(s => s !== "tokens") // tokens derived from visual
    .map(s => `- ${sectionDescriptions[s]}`)
    .join("\n")

  return `Generate a comprehensive brand concept for this business:

BUSINESS DESCRIPTION:
${safeBrief.businessDescription}

TARGET AUDIENCE:
${safeBrief.targetAudience}

BRAND PERSONALITY:
${safeBrief.personality.join(", ")}

${safeBrief.constraints ? `CONSTRAINTS:\n${safeBrief.constraints}` : ""}
${safeBrief.competitors ? `COMPETITORS/REFERENCES:\n${safeBrief.competitors}` : ""}
${safeBrief.existingName ? `EXISTING BRAND NAME: ${safeBrief.existingName}` : ""}
${safeBrief.existingLogoDescription ? `EXISTING LOGO:\n${safeBrief.existingLogoDescription}` : ""}

SECTIONS TO GENERATE:
${requestedSections}

Generate a complete brand concept. Respond with a JSON object containing only the requested sections.
Use the exact structure defined for each section.`
}

// ============================================================================
// Section Schemas for Structured Outputs
// ============================================================================

export const SECTION_SCHEMAS = {
  strategy: {
    type: "object",
    properties: {
      purpose: { type: "string" },
      promise: { type: "string" },
      positioning: { type: "string" },
      differentiation: { type: "array", items: { type: "string" } },
      messagingPillars: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pillar: { type: "string" },
            proofPoints: { type: "array", items: { type: "string" } },
          },
          required: ["pillar", "proofPoints"],
        },
      },
    },
    required: ["purpose", "promise", "positioning", "differentiation", "messagingPillars"],
  },
  naming: {
    type: "object",
    properties: {
      primaryName: { type: "string" },
      nameRationale: { type: "string" },
      alternatives: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            rationale: { type: "string" },
          },
          required: ["name", "rationale"],
        },
      },
      taglineOptions: { type: "array", items: { type: "string" } },
      toneOfVoice: {
        type: "object",
        properties: {
          description: { type: "string" },
          dos: { type: "array", items: { type: "string" } },
          donts: { type: "array", items: { type: "string" } },
          examplePhrases: { type: "array", items: { type: "string" } },
        },
        required: ["description", "dos", "donts", "examplePhrases"],
      },
    },
    required: ["primaryName", "nameRationale", "alternatives", "taglineOptions", "toneOfVoice"],
  },
  visual: {
    type: "object",
    properties: {
      colorPalette: {
        type: "object",
        properties: {
          primary: { type: "object", properties: { hex: { type: "string" }, usage: { type: "string" } }, required: ["hex", "usage"] },
          secondary: { type: "object", properties: { hex: { type: "string" }, usage: { type: "string" } }, required: ["hex", "usage"] },
          accent: { type: "object", properties: { hex: { type: "string" }, usage: { type: "string" } }, required: ["hex", "usage"] },
          neutralLight: { type: "object", properties: { hex: { type: "string" }, usage: { type: "string" } }, required: ["hex", "usage"] },
          neutralDark: { type: "object", properties: { hex: { type: "string" }, usage: { type: "string" } }, required: ["hex", "usage"] },
          reasoning: { type: "string" },
        },
        required: ["primary", "secondary", "accent", "neutralLight", "neutralDark", "reasoning"],
      },
      typography: {
        type: "object",
        properties: {
          headingFont: { type: "string" },
          bodyFont: { type: "string" },
          monoFont: { type: ["string", "null"] },
          reasoning: { type: "string" },
        },
        required: ["headingFont", "bodyFont", "reasoning"],
      },
      logoDirections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            concept: { type: "string" },
            promptText: { type: "string" },
          },
          required: ["concept", "promptText"],
        },
      },
      iconographyStyle: { type: "string" },
      illustrationStyle: { type: "string" },
    },
    required: ["colorPalette", "typography", "logoDirections", "iconographyStyle", "illustrationStyle"],
  },
  prompts: {
    type: "object",
    properties: {
      logoPrompt: { type: "string" },
      iconPrompt: { type: "string" },
      heroImagePrompt: { type: "string" },
      socialMediaPrompts: { type: "array", items: { type: "string" } },
      photographyStyle: { type: "string" },
    },
    required: ["logoPrompt", "iconPrompt", "heroImagePrompt", "socialMediaPrompts", "photographyStyle"],
  },
  appliedExamples: {
    type: "object",
    properties: {
      homepageHero: {
        type: "object",
        properties: {
          headline: { type: "string" },
          subheadline: { type: "string" },
          ctaText: { type: "string" },
        },
        required: ["headline", "subheadline", "ctaText"],
      },
      socialPosts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            platform: { type: "string" },
            content: { type: "string" },
          },
          required: ["platform", "content"],
        },
      },
      emailSignature: { type: "string" },
    },
    required: ["homepageHero", "socialPosts", "emailSignature"],
  },
}
