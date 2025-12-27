import { ThemePreset, ThemeColorSet, TypographySettings, defaultTypography } from "./theme-presets"
import { BrandConcept, BrandVisual, BrandTokens } from "./brand-concept-types"
import {
  hexToHslString,
  getContrastForeground,
  darkenHex,
  lightenHex,
} from "./color-utils"

// Re-export for backwards compatibility
export { hexToHslString as hexToHsl } from "./color-utils"

// ============================================================================
// Theme Preset Generation
// ============================================================================

/**
 * Convert BrandVisual to ThemeColorSet for light mode
 */
function visualToLightColorSet(visual: BrandVisual): ThemeColorSet {
  const primary = visual.colorPalette.primary.hex
  const secondary = visual.colorPalette.secondary.hex
  const accent = visual.colorPalette.accent.hex
  const neutralLight = visual.colorPalette.neutralLight.hex
  const neutralDark = visual.colorPalette.neutralDark.hex

  return {
    background: "0 0% 100%",
    foreground: hexToHslString(neutralDark),
    card: "0 0% 100%",
    cardForeground: hexToHslString(neutralDark),
    popover: "0 0% 100%",
    popoverForeground: hexToHslString(neutralDark),
    primary: hexToHslString(primary),
    primaryForeground: getContrastForeground(primary),
    secondary: hexToHslString(lightenHex(secondary, 85)),
    secondaryForeground: hexToHslString(secondary),
    muted: hexToHslString(lightenHex(neutralLight, 50)),
    mutedForeground: hexToHslString(lightenHex(neutralDark, 40)),
    accent: hexToHslString(lightenHex(accent, 85)),
    accentForeground: hexToHslString(accent),
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 98%",
    border: hexToHslString(lightenHex(neutralLight, 20)),
    input: hexToHslString(lightenHex(neutralLight, 20)),
    ring: hexToHslString(primary),
    chart1: hexToHslString(primary),
    chart2: hexToHslString(secondary),
    chart3: hexToHslString(accent),
    chart4: hexToHslString(lightenHex(primary, 30)),
    chart5: hexToHslString(lightenHex(secondary, 30)),
    radius: "0.5rem",
  }
}

/**
 * Convert BrandVisual to ThemeColorSet for dark mode
 */
function visualToDarkColorSet(visual: BrandVisual): ThemeColorSet {
  const primary = visual.colorPalette.primary.hex
  const secondary = visual.colorPalette.secondary.hex
  const accent = visual.colorPalette.accent.hex
  const neutralDark = visual.colorPalette.neutralDark.hex

  return {
    background: hexToHslString(darkenHex(neutralDark, 50)),
    foreground: "0 0% 98%",
    card: hexToHslString(darkenHex(neutralDark, 40)),
    cardForeground: "0 0% 98%",
    popover: hexToHslString(darkenHex(neutralDark, 40)),
    popoverForeground: "0 0% 98%",
    primary: hexToHslString(primary),
    primaryForeground: getContrastForeground(primary),
    secondary: hexToHslString(darkenHex(secondary, 60)),
    secondaryForeground: "0 0% 98%",
    muted: hexToHslString(darkenHex(neutralDark, 30)),
    mutedForeground: "0 0% 65%",
    accent: hexToHslString(darkenHex(accent, 60)),
    accentForeground: "0 0% 98%",
    destructive: "0 62% 50%",
    destructiveForeground: "0 0% 98%",
    border: hexToHslString(darkenHex(neutralDark, 20)),
    input: hexToHslString(darkenHex(neutralDark, 20)),
    ring: hexToHslString(primary),
    chart1: hexToHslString(primary),
    chart2: hexToHslString(secondary),
    chart3: hexToHslString(accent),
    chart4: hexToHslString(lightenHex(primary, 20)),
    chart5: hexToHslString(lightenHex(secondary, 20)),
    radius: "0.5rem",
  }
}

/**
 * Convert BrandConcept to ThemePreset
 */
export function brandConceptToThemePreset(concept: BrandConcept): ThemePreset | null {
  if (!concept.visual) {
    return null
  }

  const name = concept.naming?.primaryName || concept.brief.existingName || "Generated Brand"

  return {
    name,
    colors: {
      light: visualToLightColorSet(concept.visual),
      dark: visualToDarkColorSet(concept.visual),
    },
  }
}

/**
 * Extract BrandTokens from BrandConcept
 */
export function extractBrandTokens(concept: BrandConcept): BrandTokens | null {
  if (!concept.visual) {
    return null
  }

  const typography: Partial<TypographySettings> = {
    sansSerifFont: concept.visual.typography.bodyFont || defaultTypography.sansSerifFont,
    serifFont: defaultTypography.serifFont,
    monospaceFont: concept.visual.typography.monoFont || defaultTypography.monospaceFont,
    letterSpacing: 0,
  }

  return {
    colors: {
      light: visualToLightColorSet(concept.visual),
      dark: visualToDarkColorSet(concept.visual),
    },
    typography,
  }
}

// ============================================================================
// Markdown Generation
// ============================================================================

/**
 * Generate brand-concept.md markdown content
 */
export function generateBrandConceptMarkdown(concept: BrandConcept): string {
  const sections: string[] = []

  // Header
  const brandName = concept.naming?.primaryName || concept.brief.existingName || "Brand Concept"
  sections.push(`# ${brandName} - Brand Concept\n`)
  sections.push(`*Generated on ${new Date(concept.generatedAt).toLocaleDateString()}*\n`)

  // Strategy Section
  if (concept.strategy) {
    sections.push(`## Brand Strategy\n`)
    sections.push(`### Purpose\n${concept.strategy.purpose}\n`)
    sections.push(`### Brand Promise\n${concept.strategy.promise}\n`)
    sections.push(`### Positioning\n${concept.strategy.positioning}\n`)
    sections.push(`### Key Differentiators\n`)
    concept.strategy.differentiation.forEach((d) => sections.push(`- ${d}`))
    sections.push(`\n### Messaging Pillars\n`)
    concept.strategy.messagingPillars.forEach((pillar) => {
      sections.push(`#### ${pillar.pillar}\n`)
      pillar.proofPoints.forEach((p) => sections.push(`- ${p}`))
      sections.push("")
    })
  }

  // Naming Section
  if (concept.naming) {
    sections.push(`## Naming & Verbal Identity\n`)
    sections.push(`### Primary Name: ${concept.naming.primaryName}\n`)
    sections.push(`${concept.naming.nameRationale}\n`)
    sections.push(`### Alternative Names\n`)
    concept.naming.alternatives.forEach((alt) => {
      sections.push(`- **${alt.name}**: ${alt.rationale}`)
    })
    sections.push(`\n### Tagline Options\n`)
    concept.naming.taglineOptions.forEach((t) => sections.push(`- "${t}"`))
    sections.push(`\n### Tone of Voice\n`)
    sections.push(`${concept.naming.toneOfVoice.description}\n`)
    sections.push(`#### Do:\n`)
    concept.naming.toneOfVoice.dos.forEach((d) => sections.push(`- ${d}`))
    sections.push(`\n#### Don't:\n`)
    concept.naming.toneOfVoice.donts.forEach((d) => sections.push(`- ${d}`))
    sections.push(`\n#### Example Phrases:\n`)
    concept.naming.toneOfVoice.examplePhrases.forEach((p) => sections.push(`> "${p}"`))
    sections.push("")
  }

  // Visual Identity Section
  if (concept.visual) {
    sections.push(`## Visual Identity\n`)
    sections.push(`### Color Palette\n`)
    sections.push(`${concept.visual.colorPalette.reasoning}\n`)
    sections.push(`| Role | Color | Usage |`)
    sections.push(`|------|-------|-------|`)
    sections.push(`| Primary | ${concept.visual.colorPalette.primary.hex} | ${concept.visual.colorPalette.primary.usage} |`)
    sections.push(`| Secondary | ${concept.visual.colorPalette.secondary.hex} | ${concept.visual.colorPalette.secondary.usage} |`)
    sections.push(`| Accent | ${concept.visual.colorPalette.accent.hex} | ${concept.visual.colorPalette.accent.usage} |`)
    sections.push(`| Neutral Light | ${concept.visual.colorPalette.neutralLight.hex} | ${concept.visual.colorPalette.neutralLight.usage} |`)
    sections.push(`| Neutral Dark | ${concept.visual.colorPalette.neutralDark.hex} | ${concept.visual.colorPalette.neutralDark.usage} |`)
    sections.push(`\n### Typography\n`)
    sections.push(`${concept.visual.typography.reasoning}\n`)
    sections.push(`- **Headings**: ${concept.visual.typography.headingFont}`)
    sections.push(`- **Body**: ${concept.visual.typography.bodyFont}`)
    if (concept.visual.typography.monoFont) {
      sections.push(`- **Monospace**: ${concept.visual.typography.monoFont}`)
    }
    sections.push(`\n### Logo Directions\n`)
    concept.visual.logoDirections.forEach((dir, i) => {
      sections.push(`#### Direction ${i + 1}: ${dir.concept}\n`)
    })
    sections.push(`\n### Iconography Style\n${concept.visual.iconographyStyle}\n`)
    sections.push(`### Illustration Style\n${concept.visual.illustrationStyle}\n`)
  }

  // Applied Examples Section
  if (concept.appliedExamples) {
    sections.push(`## Applied Examples\n`)
    sections.push(`### Homepage Hero\n`)
    sections.push(`**Headline:** ${concept.appliedExamples.homepageHero.headline}\n`)
    sections.push(`**Subheadline:** ${concept.appliedExamples.homepageHero.subheadline}\n`)
    sections.push(`**CTA:** ${concept.appliedExamples.homepageHero.ctaText}\n`)
    sections.push(`### Social Media Posts\n`)
    concept.appliedExamples.socialPosts.forEach((post) => {
      sections.push(`#### ${post.platform}\n`)
      sections.push(`${post.content}\n`)
    })
    sections.push(`### Email Signature\n`)
    sections.push("```")
    sections.push(concept.appliedExamples.emailSignature)
    sections.push("```\n")
  }

  return sections.join("\n")
}

/**
 * Generate brand-prompts.md markdown content
 */
export function generateBrandPromptsMarkdown(concept: BrandConcept): string {
  const sections: string[] = []

  const brandName = concept.naming?.primaryName || concept.brief.existingName || "Brand"
  sections.push(`# ${brandName} - AI Image Prompts\n`)
  sections.push(`*Use these prompts with Midjourney, DALL-E, Stable Diffusion, or other AI image tools.*\n`)

  if (concept.prompts) {
    sections.push(`## Logo Generation\n`)
    sections.push("```")
    sections.push(concept.prompts.logoPrompt)
    sections.push("```\n")

    sections.push(`## Icon Set\n`)
    sections.push("```")
    sections.push(concept.prompts.iconPrompt)
    sections.push("```\n")

    sections.push(`## Hero Image\n`)
    sections.push("```")
    sections.push(concept.prompts.heroImagePrompt)
    sections.push("```\n")

    sections.push(`## Social Media Graphics\n`)
    concept.prompts.socialMediaPrompts.forEach((prompt, i) => {
      sections.push(`### Post ${i + 1}\n`)
      sections.push("```")
      sections.push(prompt)
      sections.push("```\n")
    })

    sections.push(`## Photography Style Guide\n`)
    sections.push(concept.prompts.photographyStyle + "\n")
  }

  // Include logo directions from visual spec
  if (concept.visual?.logoDirections) {
    sections.push(`## Logo Concept Prompts\n`)
    concept.visual.logoDirections.forEach((dir, i) => {
      sections.push(`### Concept ${i + 1}: ${dir.concept}\n`)
      sections.push("```")
      sections.push(dir.promptText)
      sections.push("```\n")
    })
  }

  return sections.join("\n")
}

/**
 * Generate brand-tokens.json content
 */
export function generateBrandTokensJson(concept: BrandConcept): string {
  const tokens = extractBrandTokens(concept)
  if (!tokens) {
    return JSON.stringify({ error: "No visual specification available" }, null, 2)
  }

  return JSON.stringify(
    {
      name: concept.naming?.primaryName || concept.brief.existingName || "Generated Brand",
      generatedAt: concept.generatedAt,
      colors: tokens.colors,
      typography: tokens.typography,
    },
    null,
    2
  )
}

// ============================================================================
// Download Utilities
// ============================================================================

/**
 * Download content as a file
 * Returns true on success, false on failure
 */
export function downloadFile(content: string, filename: string, mimeType: string = "text/plain"): boolean {
  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // Defer URL revocation to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 100)
    return true
  } catch (error) {
    console.error("Download failed:", error)
    return false
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
