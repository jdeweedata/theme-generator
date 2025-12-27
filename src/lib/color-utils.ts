// ============================================================================
// Consolidated Color Conversion Utilities
// Single source of truth for all HSL/HEX/RGB conversions
// ============================================================================

/**
 * HSL color type with numeric values
 */
export interface HSLColor {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
}

// ============================================================================
// HSL String Parsing and Formatting
// ============================================================================

/**
 * Parse HSL string to individual values
 * Input: "210 80% 50%" or "210 80 50"
 * Returns: { h: 210, s: 80, l: 50 } or null if invalid
 */
export function parseHslString(hslString: string): HSLColor | null {
  const match = hslString.match(/^([\d.]+)\s+([\d.]+)%?\s+([\d.]+)%?$/)
  if (!match) return null
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  }
}

/**
 * Format HSL values to CSS string (without hsl() wrapper)
 * Returns: "210 80% 50%"
 */
export function formatHslString(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`
}

/**
 * Format HSLColor object to CSS string
 */
export function hslColorToString(color: HSLColor): string {
  return formatHslString(color.h, color.s, color.l)
}

// ============================================================================
// HSL to RGB/HEX Conversion
// ============================================================================

/**
 * Convert HSL values to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  // Normalize
  const hNorm = h / 360
  const sNorm = s / 100
  const lNorm = l / 100

  let r: number, g: number, b: number

  if (sNorm === 0) {
    r = g = b = lNorm
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
    const p = 2 * lNorm - q
    r = hue2rgb(p, q, hNorm + 1 / 3)
    g = hue2rgb(p, q, hNorm)
    b = hue2rgb(p, q, hNorm - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * Convert HSL string to RGB
 * Input: "210 80% 50%"
 */
export function hslStringToRgb(hslString: string): { r: number; g: number; b: number } {
  const parsed = parseHslString(hslString)
  if (!parsed) return { r: 0, g: 0, b: 0 }
  return hslToRgb(parsed.h, parsed.s, parsed.l)
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

/**
 * Convert HSL values to HEX
 */
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
}

/**
 * Convert HSLColor object to HEX
 */
export function hslColorToHex(color: HSLColor): string {
  return hslToHex(color.h, color.s, color.l)
}

/**
 * Convert HSL string to HEX
 * Input: "210 80% 50%"
 */
export function hslStringToHex(hslString: string): string {
  const { r, g, b } = hslStringToRgb(hslString)
  return rgbToHex(r, g, b)
}

// ============================================================================
// HEX to HSL Conversion
// ============================================================================

/**
 * Validate HEX color format
 */
export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)
}

/**
 * Normalize HEX to 6-digit format
 */
export function normalizeHex(hex: string): string {
  hex = hex.replace(/^#/, "")
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  return hex.toUpperCase()
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = normalizeHex(hex)
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

/**
 * Convert HEX to HSLColor object
 */
export function hexToHslColor(hex: string): HSLColor {
  const rgb = hexToRgb(hex)
  if (!rgb) return { h: 0, s: 0, l: 0 }

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Convert HEX to HSL string
 * Returns: "210 80% 50%"
 */
export function hexToHslString(hex: string): string {
  const color = hexToHslColor(hex)
  return formatHslString(color.h, color.s, color.l)
}

// ============================================================================
// Color Manipulation
// ============================================================================

/**
 * Darken a HEX color by a percentage
 */
export function darkenHex(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = Math.max(0, Math.round(rgb.r * (1 - percent / 100)))
  const g = Math.max(0, Math.round(rgb.g * (1 - percent / 100)))
  const b = Math.max(0, Math.round(rgb.b * (1 - percent / 100)))

  return rgbToHex(r, g, b)
}

/**
 * Lighten a HEX color by a percentage
 */
export function lightenHex(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * (percent / 100)))
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * (percent / 100)))
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * (percent / 100)))

  return rgbToHex(r, g, b)
}

// ============================================================================
// Contrast and Accessibility
// ============================================================================

/**
 * Calculate relative luminance of RGB values (WCAG 2.0 formula)
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Get relative luminance from HEX color
 */
export function getLuminanceFromHex(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  return getRelativeLuminance(rgb.r, rgb.g, rgb.b)
}

/**
 * Generate appropriate foreground color (light or dark) based on background luminance
 * Returns HSL string
 */
export function getContrastForeground(bgHex: string): string {
  const luminance = getLuminanceFromHex(bgHex)
  // Return light or dark foreground based on background brightness
  return luminance > 0.5 ? "0 0% 9%" : "0 0% 98%"
}

/**
 * Calculate contrast ratio between two HSL strings
 * Returns a value between 1 and 21
 */
export function getContrastRatio(hsl1: string, hsl2: string): number {
  const rgb1 = hslStringToRgb(hsl1)
  const rgb2 = hslStringToRgb(hsl2)

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG 2.0 AA standard
 * Normal text: 4.5:1, Large text: 3:1
 */
export function meetsWCAG_AA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Check if contrast ratio meets WCAG 2.0 AAA standard
 * Normal text: 7:1, Large text: 4.5:1
 */
export function meetsWCAG_AAA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 4.5 : ratio >= 7
}

/**
 * Get contrast rating label
 */
export function getContrastRating(ratio: number): "fail" | "aa" | "aaa" {
  if (ratio >= 7) return "aaa"
  if (ratio >= 4.5) return "aa"
  return "fail"
}
