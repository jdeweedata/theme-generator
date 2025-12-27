import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ThemeColorSet, themePresets, defaultTypography } from "@/lib/theme-presets"

// ============================================================================
// Theme Export API
// GET /api/theme/export - Export theme as CSS variables
// ============================================================================

/**
 * HSL color validation for custom colors
 */
const hslColorSchema = z.string().regex(
  /^\d{1,3}(\.\d+)?\s+\d{1,3}(\.\d+)?%\s+\d{1,3}(\.\d+)?%$/
)

const radiusSchema = z.string().regex(/^\d+(\.\d+)?(rem|px|em)$/)

const themeColorSetSchema = z.object({
  background: hslColorSchema,
  foreground: hslColorSchema,
  card: hslColorSchema,
  cardForeground: hslColorSchema,
  popover: hslColorSchema,
  popoverForeground: hslColorSchema,
  primary: hslColorSchema,
  primaryForeground: hslColorSchema,
  secondary: hslColorSchema,
  secondaryForeground: hslColorSchema,
  muted: hslColorSchema,
  mutedForeground: hslColorSchema,
  accent: hslColorSchema,
  accentForeground: hslColorSchema,
  destructive: hslColorSchema,
  destructiveForeground: hslColorSchema,
  border: hslColorSchema,
  input: hslColorSchema,
  ring: hslColorSchema,
  chart1: hslColorSchema,
  chart2: hslColorSchema,
  chart3: hslColorSchema,
  chart4: hslColorSchema,
  chart5: hslColorSchema,
  radius: radiusSchema,
})

/**
 * Generate CSS variables from a color set
 */
function generateCSSVariables(colors: ThemeColorSet, selector: string): string {
  const variables = [
    `  --background: ${colors.background};`,
    `  --foreground: ${colors.foreground};`,
    `  --card: ${colors.card};`,
    `  --card-foreground: ${colors.cardForeground};`,
    `  --popover: ${colors.popover};`,
    `  --popover-foreground: ${colors.popoverForeground};`,
    `  --primary: ${colors.primary};`,
    `  --primary-foreground: ${colors.primaryForeground};`,
    `  --secondary: ${colors.secondary};`,
    `  --secondary-foreground: ${colors.secondaryForeground};`,
    `  --muted: ${colors.muted};`,
    `  --muted-foreground: ${colors.mutedForeground};`,
    `  --accent: ${colors.accent};`,
    `  --accent-foreground: ${colors.accentForeground};`,
    `  --destructive: ${colors.destructive};`,
    `  --destructive-foreground: ${colors.destructiveForeground};`,
    `  --border: ${colors.border};`,
    `  --input: ${colors.input};`,
    `  --ring: ${colors.ring};`,
    `  --chart-1: ${colors.chart1};`,
    `  --chart-2: ${colors.chart2};`,
    `  --chart-3: ${colors.chart3};`,
    `  --chart-4: ${colors.chart4};`,
    `  --chart-5: ${colors.chart5};`,
    `  --radius: ${colors.radius};`,
  ]

  return `${selector} {\n${variables.join("\n")}\n}`
}

/**
 * GET /api/theme/export
 * Export theme as CSS variables
 *
 * Query params:
 *   - preset: Name of preset (optional, default: "Default")
 *   - format: "css" | "tailwind" | "json" (default: "css")
 *   - mode: "both" | "light" | "dark" (default: "both")
 *
 * Or POST with custom colors in body
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const presetName = searchParams.get("preset") || "Default"
  const format = searchParams.get("format") || "css"
  const mode = searchParams.get("mode") || "both"

  // Find preset
  const preset = themePresets.find(
    (p) => p.name.toLowerCase() === presetName.toLowerCase()
  )

  if (!preset) {
    return NextResponse.json(
      {
        success: false,
        error: `Preset "${presetName}" not found`,
        availablePresets: themePresets.map((p) => p.name),
      },
      { status: 404 }
    )
  }

  // Generate output based on format
  if (format === "json") {
    const output: Record<string, unknown> = {
      preset: preset.name,
      typography: defaultTypography,
    }

    if (mode === "both" || mode === "light") {
      output.light = preset.colors.light
    }
    if (mode === "both" || mode === "dark") {
      output.dark = preset.colors.dark
    }

    return NextResponse.json({
      success: true,
      format: "json",
      theme: output,
    })
  }

  // Generate CSS
  const cssBlocks: string[] = []

  if (mode === "both" || mode === "light") {
    cssBlocks.push(generateCSSVariables(preset.colors.light, ":root"))
  }

  if (mode === "both" || mode === "dark") {
    cssBlocks.push(generateCSSVariables(preset.colors.dark, ".dark"))
  }

  const css = `@layer base {\n${cssBlocks.join("\n\n")}\n}`

  if (format === "tailwind") {
    // Tailwind config format
    return NextResponse.json({
      success: true,
      format: "tailwind",
      preset: preset.name,
      css,
      tailwindConfig: {
        theme: {
          extend: {
            colors: {
              background: "hsl(var(--background))",
              foreground: "hsl(var(--foreground))",
              card: {
                DEFAULT: "hsl(var(--card))",
                foreground: "hsl(var(--card-foreground))",
              },
              popover: {
                DEFAULT: "hsl(var(--popover))",
                foreground: "hsl(var(--popover-foreground))",
              },
              primary: {
                DEFAULT: "hsl(var(--primary))",
                foreground: "hsl(var(--primary-foreground))",
              },
              secondary: {
                DEFAULT: "hsl(var(--secondary))",
                foreground: "hsl(var(--secondary-foreground))",
              },
              muted: {
                DEFAULT: "hsl(var(--muted))",
                foreground: "hsl(var(--muted-foreground))",
              },
              accent: {
                DEFAULT: "hsl(var(--accent))",
                foreground: "hsl(var(--accent-foreground))",
              },
              destructive: {
                DEFAULT: "hsl(var(--destructive))",
                foreground: "hsl(var(--destructive-foreground))",
              },
              border: "hsl(var(--border))",
              input: "hsl(var(--input))",
              ring: "hsl(var(--ring))",
              chart: {
                1: "hsl(var(--chart-1))",
                2: "hsl(var(--chart-2))",
                3: "hsl(var(--chart-3))",
                4: "hsl(var(--chart-4))",
                5: "hsl(var(--chart-5))",
              },
            },
            borderRadius: {
              lg: "var(--radius)",
              md: "calc(var(--radius) - 2px)",
              sm: "calc(var(--radius) - 4px)",
            },
          },
        },
      },
    })
  }

  // Default CSS format
  return NextResponse.json({
    success: true,
    format: "css",
    preset: preset.name,
    css,
  })
}

/**
 * POST /api/theme/export
 * Export custom theme colors as CSS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { colors, format = "css", mode = "both" } = body

    // Validate colors if provided
    if (colors) {
      if (colors.light) {
        const lightValidation = themeColorSetSchema.safeParse(colors.light)
        if (!lightValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid light theme colors",
              details: lightValidation.error.issues,
            },
            { status: 400 }
          )
        }
      }
      if (colors.dark) {
        const darkValidation = themeColorSetSchema.safeParse(colors.dark)
        if (!darkValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid dark theme colors",
              details: darkValidation.error.issues,
            },
            { status: 400 }
          )
        }
      }
    }

    // Use provided colors or default preset
    const lightColors = colors?.light || themePresets[0].colors.light
    const darkColors = colors?.dark || themePresets[0].colors.dark

    // Generate CSS
    const cssBlocks: string[] = []

    if (mode === "both" || mode === "light") {
      cssBlocks.push(generateCSSVariables(lightColors, ":root"))
    }

    if (mode === "both" || mode === "dark") {
      cssBlocks.push(generateCSSVariables(darkColors, ".dark"))
    }

    const css = `@layer base {\n${cssBlocks.join("\n\n")}\n}`

    if (format === "json") {
      return NextResponse.json({
        success: true,
        format: "json",
        theme: {
          light: mode === "both" || mode === "light" ? lightColors : undefined,
          dark: mode === "both" || mode === "dark" ? darkColors : undefined,
        },
      })
    }

    return NextResponse.json({
      success: true,
      format: "css",
      css,
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export theme",
      },
      { status: 500 }
    )
  }
}
