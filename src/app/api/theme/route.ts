import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ThemeColorSet, TypographySettings, themePresets, defaultTypography } from "@/lib/theme-presets"

// ============================================================================
// Theme State API
// GET  /api/theme - Get current theme state (from query params or defaults)
// PUT  /api/theme - Update theme colors/typography
// ============================================================================

/**
 * HSL color format validation
 */
const hslColorSchema = z.string().regex(
  /^\d{1,3}(\.\d+)?\s+\d{1,3}(\.\d+)?%\s+\d{1,3}(\.\d+)?%$/,
  "Invalid HSL color format (expected: '210 80% 50%')"
)

/**
 * Radius format validation
 */
const radiusSchema = z.string().regex(
  /^\d+(\.\d+)?(rem|px|em)$/,
  "Invalid radius format (expected: '0.5rem')"
)

/**
 * Safe font name validation
 */
const safeFontSchema = z.string().regex(
  /^[a-zA-Z0-9\s\-,']+$/,
  "Invalid font name"
).max(100)

/**
 * Theme color set schema for validation
 */
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
 * Typography schema
 */
const typographySchema = z.object({
  sansSerifFont: safeFontSchema,
  serifFont: safeFontSchema,
  monospaceFont: safeFontSchema,
  letterSpacing: z.number().min(-0.5).max(0.5),
})

/**
 * PUT request body schema
 */
const updateThemeSchema = z.object({
  preset: z.string().max(50).optional(),
  isDarkMode: z.boolean().optional(),
  colors: z.object({
    light: themeColorSetSchema.partial().optional(),
    dark: themeColorSetSchema.partial().optional(),
  }).optional(),
  typography: typographySchema.partial().optional(),
})

/**
 * GET /api/theme
 * Returns the default theme state or a specific preset
 * Query params:
 *   - preset: Name of preset to return (optional)
 *   - mode: "light" or "dark" (optional, default: "light")
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const presetName = searchParams.get("preset")
  const mode = searchParams.get("mode") === "dark" ? "dark" : "light"

  // Find preset or use default
  let preset = themePresets[0] // Default preset
  if (presetName) {
    const found = themePresets.find(
      (p) => p.name.toLowerCase() === presetName.toLowerCase()
    )
    if (!found) {
      return NextResponse.json(
        {
          success: false,
          error: `Preset "${presetName}" not found`,
          availablePresets: themePresets.map((p) => p.name),
        },
        { status: 404 }
      )
    }
    preset = found
  }

  return NextResponse.json({
    success: true,
    theme: {
      preset: preset.name,
      isDarkMode: mode === "dark",
      colors: {
        light: preset.colors.light,
        dark: preset.colors.dark,
      },
      currentColors: preset.colors[mode],
      typography: defaultTypography,
    },
  })
}

/**
 * PUT /api/theme
 * Update theme colors and/or typography
 * Returns the merged theme state
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = updateThemeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid theme data",
          details: validation.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    const { preset: presetName, isDarkMode = false, colors, typography } = validation.data

    // Get base preset
    let basePreset = themePresets[0]
    if (presetName) {
      const found = themePresets.find(
        (p) => p.name.toLowerCase() === presetName.toLowerCase()
      )
      if (!found) {
        return NextResponse.json(
          {
            success: false,
            error: `Preset "${presetName}" not found`,
          },
          { status: 404 }
        )
      }
      basePreset = found
    }

    // Merge colors with preset
    const mergedColors = {
      light: {
        ...basePreset.colors.light,
        ...(colors?.light || {}),
      } as ThemeColorSet,
      dark: {
        ...basePreset.colors.dark,
        ...(colors?.dark || {}),
      } as ThemeColorSet,
    }

    // Merge typography
    const mergedTypography: TypographySettings = {
      ...defaultTypography,
      ...(typography || {}),
    }

    const mode = isDarkMode ? "dark" : "light"

    return NextResponse.json({
      success: true,
      theme: {
        preset: presetName || basePreset.name,
        isDarkMode,
        colors: mergedColors,
        currentColors: mergedColors[mode],
        typography: mergedTypography,
      },
    })
  } catch (error) {
    console.error("Theme update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update theme",
      },
      { status: 500 }
    )
  }
}
