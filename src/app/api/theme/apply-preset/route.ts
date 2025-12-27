import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { themePresets, defaultTypography } from "@/lib/theme-presets"

// ============================================================================
// Apply Preset API
// POST /api/theme/apply-preset - Apply a named preset to get full theme
// ============================================================================

const applyPresetSchema = z.object({
  preset: z.string().min(1, "Preset name is required"),
  isDarkMode: z.boolean().optional().default(false),
})

/**
 * POST /api/theme/apply-preset
 * Apply a preset by name and return the full theme configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = applyPresetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: validation.error.issues.map((i) => i.message),
        },
        { status: 400 }
      )
    }

    const { preset: presetName, isDarkMode } = validation.data

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

    const mode = isDarkMode ? "dark" : "light"

    return NextResponse.json({
      success: true,
      applied: {
        preset: preset.name,
        isDarkMode,
        colors: {
          light: preset.colors.light,
          dark: preset.colors.dark,
        },
        currentColors: preset.colors[mode],
        typography: defaultTypography,
      },
    })
  } catch (error) {
    console.error("Apply preset error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply preset",
      },
      { status: 500 }
    )
  }
}
