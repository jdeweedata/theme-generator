import { ThemePreset, ThemeColorSet, TypographySettings, defaultTypography } from "./theme-presets"
import { BrandConcept, BrandVisual, BrandTokens } from "./brand-concept-types"

// ============================================================================
// Color Conversion Utilities
// ============================================================================

/**
 * Convert hex color to HSL string (without hsl() wrapper)
 * Returns format: "210 80% 50%"
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, "")

  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    console.error(`Invalid hex color: #${hex}`)
    return "0 0% 50%" // Return neutral gray as fallback
  }

  // Parse hex
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Generate a foreground color (light or dark) based on background luminance
 */
function getContrastForeground(bgHex: string): string {
  const hex = bgHex.replace(/^#/, "")
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return light or dark foreground
  return luminance > 0.5 ? "0 0% 9%" : "0 0% 98%"
}

/**
 * Darken a hex color by a percentage
 */
function darkenHex(hex: string, percent: number): string {
  hex = hex.replace(/^#/, "")
  const r = Math.max(0, Math.round(parseInt(hex.slice(0, 2), 16) * (1 - percent / 100)))
  const g = Math.max(0, Math.round(parseInt(hex.slice(2, 4), 16) * (1 - percent / 100)))
  const b = Math.max(0, Math.round(parseInt(hex.slice(4, 6), 16) * (1 - percent / 100)))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

/**
 * Lighten a hex color by a percentage
 */
function lightenHex(hex: string, percent: number): string {
  hex = hex.replace(/^#/, "")
  const r = Math.min(255, Math.round(parseInt(hex.slice(0, 2), 16) + (255 - parseInt(hex.slice(0, 2), 16)) * (percent / 100)))
  const g = Math.min(255, Math.round(parseInt(hex.slice(2, 4), 16) + (255 - parseInt(hex.slice(2, 4), 16)) * (percent / 100)))
  const b = Math.min(255, Math.round(parseInt(hex.slice(4, 6), 16) + (255 - parseInt(hex.slice(4, 6), 16)) * (percent / 100)))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

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
    foreground: hexToHsl(neutralDark),
    card: "0 0% 100%",
    cardForeground: hexToHsl(neutralDark),
    popover: "0 0% 100%",
    popoverForeground: hexToHsl(neutralDark),
    primary: hexToHsl(primary),
    primaryForeground: getContrastForeground(primary),
    secondary: hexToHsl(lightenHex(secondary, 85)),
    secondaryForeground: hexToHsl(secondary),
    muted: hexToHsl(lightenHex(neutralLight, 50)),
    mutedForeground: hexToHsl(lightenHex(neutralDark, 40)),
    accent: hexToHsl(lightenHex(accent, 85)),
    accentForeground: hexToHsl(accent),
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 98%",
    border: hexToHsl(lightenHex(neutralLight, 20)),
    input: hexToHsl(lightenHex(neutralLight, 20)),
    ring: hexToHsl(primary),
    chart1: hexToHsl(primary),
    chart2: hexToHsl(secondary),
    chart3: hexToHsl(accent),
    chart4: hexToHsl(lightenHex(primary, 30)),
    chart5: hexToHsl(lightenHex(secondary, 30)),
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
    background: hexToHsl(darkenHex(neutralDark, 50)),
    foreground: "0 0% 98%",
    card: hexToHsl(darkenHex(neutralDark, 40)),
    cardForeground: "0 0% 98%",
    popover: hexToHsl(darkenHex(neutralDark, 40)),
    popoverForeground: "0 0% 98%",
    primary: hexToHsl(primary),
    primaryForeground: getContrastForeground(primary),
    secondary: hexToHsl(darkenHex(secondary, 60)),
    secondaryForeground: "0 0% 98%",
    muted: hexToHsl(darkenHex(neutralDark, 30)),
    mutedForeground: "0 0% 65%",
    accent: hexToHsl(darkenHex(accent, 60)),
    accentForeground: "0 0% 98%",
    destructive: "0 62% 50%",
    destructiveForeground: "0 0% 98%",
    border: hexToHsl(darkenHex(neutralDark, 20)),
    input: hexToHsl(darkenHex(neutralDark, 20)),
    ring: hexToHsl(primary),
    chart1: hexToHsl(primary),
    chart2: hexToHsl(secondary),
    chart3: hexToHsl(accent),
    chart4: hexToHsl(lightenHex(primary, 20)),
    chart5: hexToHsl(lightenHex(secondary, 20)),
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
