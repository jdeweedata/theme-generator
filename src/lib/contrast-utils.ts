// WCAG 2.0 Contrast Ratio Utilities

/**
 * Convert HSL string to RGB values
 */
export function hslToRgb(hslString: string): { r: number; g: number; b: number } {
  const match = hslString.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/)
  if (!match) {
    return { r: 0, g: 0, b: 0 }
  }

  const h = parseFloat(match[1]) / 360
  const s = parseFloat(match[2]) / 100
  const l = parseFloat(match[3]) / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

/**
 * Convert HSL string to HEX
 */
export function hslToHex(hslString: string): string {
  const { r, g, b } = hslToRgb(hslString)
  return rgbToHex(r, g, b)
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
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
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(hsl1: string, hsl2: string): number {
  const rgb1 = hslToRgb(hsl1)
  const rgb2 = hslToRgb(hsl2)

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG 2.0 AA standard
 * Normal text: 4.5:1
 * Large text: 3:1
 */
export function meetsWCAG_AA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Check if contrast ratio meets WCAG 2.0 AAA standard
 * Normal text: 7:1
 * Large text: 4.5:1
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

export interface ContrastPair {
  name: string
  background: string
  foreground: string
  backgroundHex?: string
  foregroundHex?: string
  ratio?: number
  passes?: boolean
}

export interface ContrastSection {
  title: string
  pairs: ContrastPair[]
}
