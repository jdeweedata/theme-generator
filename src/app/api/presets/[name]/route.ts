import { NextRequest, NextResponse } from "next/server"
import { themePresets, defaultTypography } from "@/lib/theme-presets"
import { hslStringToHex } from "@/lib/color-utils"

// ============================================================================
// Single Preset API
// GET /api/presets/:name - Get a specific preset by name
// ============================================================================

/**
 * Get color swatches as hex
 */
function getSwatches(preset: (typeof themePresets)[0], isDark: boolean) {
  const colors = isDark ? preset.colors.dark : preset.colors.light
  return {
    primary: hslStringToHex(colors.primary),
    secondary: hslStringToHex(colors.secondary),
    accent: hslStringToHex(colors.accent),
    background: hslStringToHex(colors.background),
    foreground: hslStringToHex(colors.foreground),
    muted: hslStringToHex(colors.muted),
    border: hslStringToHex(colors.border),
  }
}

/**
 * GET /api/presets/:name
 * Get a specific preset by name
 *
 * Query params:
 *   - mode: "light" | "dark" | "both" (default: "both")
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("mode") || "both"

  // Find preset (case-insensitive)
  const preset = themePresets.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  )

  if (!preset) {
    // Suggest similar presets
    const suggestions = themePresets
      .filter((p) => p.name.toLowerCase().includes(name.toLowerCase()))
      .map((p) => p.name)
      .slice(0, 5)

    return NextResponse.json(
      {
        success: false,
        error: `Preset "${name}" not found`,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        availablePresets: themePresets.map((p) => p.name),
      },
      { status: 404 }
    )
  }

  const response: Record<string, unknown> = {
    success: true,
    preset: {
      name: preset.name,
      typography: defaultTypography,
    },
  }

  if (mode === "both" || mode === "light") {
    (response.preset as Record<string, unknown>).light = {
      colors: preset.colors.light,
      swatches: getSwatches(preset, false),
    }
  }

  if (mode === "both" || mode === "dark") {
    (response.preset as Record<string, unknown>).dark = {
      colors: preset.colors.dark,
      swatches: getSwatches(preset, true),
    }
  }

  return NextResponse.json(response)
}
