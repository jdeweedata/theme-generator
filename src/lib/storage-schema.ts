import { z } from "zod"

// ============================================================================
// Storage Schema Validation
// Validates localStorage data to prevent corrupted or malicious data
// ============================================================================

/**
 * Current schema version for migration support
 */
export const STORAGE_VERSION = 1

/**
 * Storage key - consolidated to single key
 */
export const THEME_STORAGE_KEY = "tweakcn-theme"

/**
 * HSL color format validation: "210 80% 50%"
 * Matches: H (0-360) S (0-100)% L (0-100)%
 */
const hslColorSchema = z.string().regex(
  /^\d{1,3}(\.\d+)?\s+\d{1,3}(\.\d+)?%\s+\d{1,3}(\.\d+)?%$/,
  "Invalid HSL color format"
)

/**
 * Font name validation - alphanumeric, spaces, hyphens only
 * Prevents CSS injection through font names
 */
const safeFontSchema = z.string().regex(
  /^[a-zA-Z0-9\s\-,']+$/,
  "Invalid font name"
).max(100)

/**
 * Custom colors schema - partial color overrides
 */
const customColorsSchema = z.object({
  light: z.record(z.string(), hslColorSchema).optional().default({}),
  dark: z.record(z.string(), hslColorSchema).optional().default({}),
}).optional().default({ light: {}, dark: {} })

/**
 * Typography settings schema
 */
const typographySchema = z.object({
  sansSerifFont: safeFontSchema.default("Inter"),
  serifFont: safeFontSchema.default("Georgia"),
  monospaceFont: safeFontSchema.default("JetBrains Mono"),
  letterSpacing: z.number().min(-0.5).max(0.5).default(0),
}).optional()

/**
 * Main theme storage schema
 */
export const themeStorageSchema = z.object({
  version: z.number().int().positive().default(STORAGE_VERSION),
  preset: z.string().max(50).optional(),
  isDarkMode: z.boolean().default(false),
  customColors: customColorsSchema,
  typography: typographySchema,
})

export type ThemeStorage = z.infer<typeof themeStorageSchema>

/**
 * Safe defaults for theme storage
 */
export const defaultThemeStorage: ThemeStorage = {
  version: STORAGE_VERSION,
  preset: undefined,
  isDarkMode: false,
  customColors: { light: {}, dark: {} },
  typography: undefined,
}

/**
 * Load and validate theme from localStorage
 * Returns validated data or null if invalid/missing
 */
export function loadThemeFromStorage(): ThemeStorage | null {
  if (typeof window === "undefined") return null

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (!saved) return null

    const parsed = JSON.parse(saved)
    const result = themeStorageSchema.safeParse(parsed)

    if (!result.success) {
      console.warn(
        "[Theme Storage] Invalid stored theme data, resetting:",
        result.error.flatten()
      )
      // Clear corrupted data
      localStorage.removeItem(THEME_STORAGE_KEY)
      return null
    }

    // Version migration logic would go here
    if (result.data.version < STORAGE_VERSION) {
      console.info(
        `[Theme Storage] Migrating from v${result.data.version} to v${STORAGE_VERSION}`
      )
      // Add migration logic as needed
    }

    return result.data
  } catch (e) {
    console.error("[Theme Storage] Failed to parse stored theme:", e)
    // Clear corrupted data
    try {
      localStorage.removeItem(THEME_STORAGE_KEY)
    } catch {
      // Ignore cleanup errors
    }
    return null
  }
}

/**
 * Save theme to localStorage with validation
 * Returns true on success, false on failure
 */
export function saveThemeToStorage(data: Partial<ThemeStorage>): boolean {
  if (typeof window === "undefined") return false

  try {
    // Merge with defaults and validate
    const merged = {
      ...defaultThemeStorage,
      ...data,
      version: STORAGE_VERSION,
    }

    const result = themeStorageSchema.safeParse(merged)
    if (!result.success) {
      console.error(
        "[Theme Storage] Invalid theme data, not saving:",
        result.error.flatten()
      )
      return false
    }

    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(result.data))
    return true
  } catch (e) {
    console.error("[Theme Storage] Failed to save theme:", e)
    return false
  }
}

/**
 * Clear stored theme data
 */
export function clearThemeStorage(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
    // Also clean up legacy keys
    localStorage.removeItem("theme-generator-colors")
    localStorage.removeItem("theme-generator-dark-mode")
  } catch (e) {
    console.error("[Theme Storage] Failed to clear theme:", e)
  }
}
