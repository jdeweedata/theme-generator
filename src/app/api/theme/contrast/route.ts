import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ThemeColorSet, themePresets } from "@/lib/theme-presets"
import {
  hslStringToRgb,
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  getContrastRating,
  hslStringToHex,
} from "@/lib/color-utils"

// ============================================================================
// Contrast Check API
// GET /api/theme/contrast - Check WCAG compliance for a theme
// ============================================================================

/**
 * HSL color validation
 */
const hslColorSchema = z.string().regex(
  /^\d{1,3}(\.\d+)?\s+\d{1,3}(\.\d+)?%\s+\d{1,3}(\.\d+)?%$/
)

/**
 * Contrast pair definition
 */
interface ContrastResult {
  name: string
  background: string
  foreground: string
  backgroundHex: string
  foregroundHex: string
  ratio: number
  ratioFormatted: string
  rating: "aaa" | "aa" | "fail"
  passesAA: boolean
  passesAAA: boolean
  passesAALarge: boolean
  passesAAALarge: boolean
}

/**
 * Calculate contrast for a color pair
 */
function calculateContrast(
  name: string,
  background: string,
  foreground: string
): ContrastResult {
  const ratio = getContrastRatio(background, foreground)
  return {
    name,
    background,
    foreground,
    backgroundHex: hslStringToHex(background),
    foregroundHex: hslStringToHex(foreground),
    ratio,
    ratioFormatted: `${ratio.toFixed(2)}:1`,
    rating: getContrastRating(ratio),
    passesAA: meetsWCAG_AA(ratio, false),
    passesAAA: meetsWCAG_AAA(ratio, false),
    passesAALarge: meetsWCAG_AA(ratio, true),
    passesAAALarge: meetsWCAG_AAA(ratio, true),
  }
}

/**
 * Analyze all important contrast pairs in a theme
 */
function analyzeThemeContrast(colors: ThemeColorSet): {
  pairs: ContrastResult[]
  summary: {
    total: number
    passAA: number
    passAAA: number
    failCount: number
    overallRating: "aaa" | "aa" | "fail"
  }
} {
  const pairs: ContrastResult[] = [
    // Primary surfaces
    calculateContrast("Background / Foreground", colors.background, colors.foreground),
    calculateContrast("Card / Card Foreground", colors.card, colors.cardForeground),
    calculateContrast("Popover / Popover Foreground", colors.popover, colors.popoverForeground),

    // Interactive elements
    calculateContrast("Primary / Primary Foreground", colors.primary, colors.primaryForeground),
    calculateContrast("Secondary / Secondary Foreground", colors.secondary, colors.secondaryForeground),
    calculateContrast("Accent / Accent Foreground", colors.accent, colors.accentForeground),
    calculateContrast("Destructive / Destructive Foreground", colors.destructive, colors.destructiveForeground),

    // Muted elements
    calculateContrast("Muted / Muted Foreground", colors.muted, colors.mutedForeground),
    calculateContrast("Background / Muted Foreground", colors.background, colors.mutedForeground),

    // Borders
    calculateContrast("Background / Border", colors.background, colors.border),
    calculateContrast("Card / Border", colors.card, colors.border),
  ]

  const passAA = pairs.filter((p) => p.passesAA).length
  const passAAA = pairs.filter((p) => p.passesAAA).length
  const failCount = pairs.filter((p) => !p.passesAA).length

  let overallRating: "aaa" | "aa" | "fail" = "fail"
  if (passAAA === pairs.length) {
    overallRating = "aaa"
  } else if (passAA === pairs.length) {
    overallRating = "aa"
  }

  return {
    pairs,
    summary: {
      total: pairs.length,
      passAA,
      passAAA,
      failCount,
      overallRating,
    },
  }
}

/**
 * GET /api/theme/contrast
 * Check WCAG contrast compliance for a preset
 *
 * Query params:
 *   - preset: Name of preset (optional, default: "Default")
 *   - mode: "light" | "dark" | "both" (default: "both")
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const presetName = searchParams.get("preset") || "Default"
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

  const results: Record<string, ReturnType<typeof analyzeThemeContrast>> = {}

  if (mode === "both" || mode === "light") {
    results.light = analyzeThemeContrast(preset.colors.light)
  }

  if (mode === "both" || mode === "dark") {
    results.dark = analyzeThemeContrast(preset.colors.dark)
  }

  // Overall compliance across all modes
  const allPairs = [
    ...(results.light?.pairs || []),
    ...(results.dark?.pairs || []),
  ]
  const overallPassAA = allPairs.filter((p) => p.passesAA).length
  const overallPassAAA = allPairs.filter((p) => p.passesAAA).length

  return NextResponse.json({
    success: true,
    preset: preset.name,
    mode,
    results,
    overall: {
      totalPairs: allPairs.length,
      passAA: overallPassAA,
      passAAA: overallPassAAA,
      failCount: allPairs.length - overallPassAA,
      complianceAA: allPairs.length > 0 ? `${Math.round((overallPassAA / allPairs.length) * 100)}%` : "N/A",
      complianceAAA: allPairs.length > 0 ? `${Math.round((overallPassAAA / allPairs.length) * 100)}%` : "N/A",
      meetsWCAG_AA: overallPassAA === allPairs.length,
      meetsWCAG_AAA: overallPassAAA === allPairs.length,
    },
    wcagInfo: {
      AA: {
        normalText: "4.5:1 minimum",
        largeText: "3:1 minimum",
      },
      AAA: {
        normalText: "7:1 minimum",
        largeText: "4.5:1 minimum",
      },
    },
  })
}

/**
 * POST /api/theme/contrast
 * Check contrast for custom colors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { colors, mode = "both" } = body

    if (!colors) {
      return NextResponse.json(
        {
          success: false,
          error: "Colors are required",
        },
        { status: 400 }
      )
    }

    const results: Record<string, ReturnType<typeof analyzeThemeContrast>> = {}

    if ((mode === "both" || mode === "light") && colors.light) {
      results.light = analyzeThemeContrast(colors.light)
    }

    if ((mode === "both" || mode === "dark") && colors.dark) {
      results.dark = analyzeThemeContrast(colors.dark)
    }

    if (Object.keys(results).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid color sets provided",
        },
        { status: 400 }
      )
    }

    const allPairs = [
      ...(results.light?.pairs || []),
      ...(results.dark?.pairs || []),
    ]
    const overallPassAA = allPairs.filter((p) => p.passesAA).length
    const overallPassAAA = allPairs.filter((p) => p.passesAAA).length

    return NextResponse.json({
      success: true,
      mode,
      results,
      overall: {
        totalPairs: allPairs.length,
        passAA: overallPassAA,
        passAAA: overallPassAAA,
        failCount: allPairs.length - overallPassAA,
        complianceAA: `${Math.round((overallPassAA / allPairs.length) * 100)}%`,
        complianceAAA: `${Math.round((overallPassAAA / allPairs.length) * 100)}%`,
        meetsWCAG_AA: overallPassAA === allPairs.length,
        meetsWCAG_AAA: overallPassAAA === allPairs.length,
      },
    })
  } catch (error) {
    console.error("Contrast check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check contrast",
      },
      { status: 500 }
    )
  }
}
