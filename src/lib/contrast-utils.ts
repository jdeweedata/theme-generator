// WCAG 2.0 Contrast Ratio Utilities
// Re-exports from consolidated color-utils for backwards compatibility

export {
  hslStringToRgb as hslToRgb,
  rgbToHex,
  hslStringToHex as hslToHex,
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  getContrastRating,
} from "./color-utils"

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
