import { NextRequest, NextResponse } from "next/server"
import { themePresets, fontOptions, defaultTypography } from "@/lib/theme-presets"
import { hslStringToHex } from "@/lib/color-utils"

// ============================================================================
// Presets API
// GET /api/presets - List all available theme presets
// ============================================================================

/**
 * Get primary colors as hex for preview swatches
 */
function getPresetSwatches(preset: (typeof themePresets)[0], isDark: boolean) {
  const colors = isDark ? preset.colors.dark : preset.colors.light
  return {
    primary: hslStringToHex(colors.primary),
    secondary: hslStringToHex(colors.secondary),
    accent: hslStringToHex(colors.accent),
    background: hslStringToHex(colors.background),
    foreground: hslStringToHex(colors.foreground),
  }
}

/**
 * GET /api/presets
 * List all available theme presets
 *
 * Query params:
 *   - mode: "light" | "dark" (for swatch colors, default: "light")
 *   - search: Filter presets by name (optional)
 *   - includeColors: "true" to include full color sets (default: "false")
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("mode") === "dark" ? "dark" : "light"
  const search = searchParams.get("search")?.toLowerCase()
  const includeColors = searchParams.get("includeColors") === "true"

  // Filter presets if search is provided
  let filteredPresets = themePresets
  if (search) {
    filteredPresets = themePresets.filter((p) =>
      p.name.toLowerCase().includes(search)
    )
  }

  // Map presets to response format
  const presets = filteredPresets.map((preset) => {
    const base = {
      name: preset.name,
      swatches: getPresetSwatches(preset, mode === "dark"),
    }

    if (includeColors) {
      return {
        ...base,
        colors: {
          light: preset.colors.light,
          dark: preset.colors.dark,
        },
      }
    }

    return base
  })

  return NextResponse.json({
    success: true,
    count: presets.length,
    totalAvailable: themePresets.length,
    mode,
    presets,
    fontOptions,
    defaultTypography,
  })
}
