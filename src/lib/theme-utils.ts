// HSL color type
export interface HSLColor {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
}

// Theme color configuration
export interface ThemeColors {
  primary: HSLColor
  secondary: HSLColor
  accent: HSLColor
  muted: HSLColor
  destructive: HSLColor
  background: HSLColor
  card: HSLColor
  popover: HSLColor
  border: HSLColor
  radius: number // in rem
}

// Complete theme with foreground colors auto-generated
export interface Theme {
  name: string
  colors: ThemeColors
  dark: ThemeColors
}

// Convert HSL to CSS string format (without hsl() wrapper)
export function hslToString(color: HSLColor): string {
  return `${color.h} ${color.s}% ${color.l}%`
}

// Convert HSL to HEX
export function hslToHex(color: HSLColor): string {
  const { h, s, l } = color
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Convert HEX to HSL
export function hexToHsl(hex: string): HSLColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, l: 0 }

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

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

// Generate appropriate foreground color based on background lightness
export function getForegroundColor(background: HSLColor): HSLColor {
  // If background is dark (l < 50), use light foreground
  // If background is light (l >= 50), use dark foreground
  if (background.l < 50) {
    return { h: background.h, s: 0, l: 98 }
  }
  return { h: background.h, s: 0, l: 3.9 }
}

// Generate muted foreground based on background
export function getMutedForeground(background: HSLColor): HSLColor {
  if (background.l < 50) {
    return { h: 0, s: 0, l: 63.9 }
  }
  return { h: 0, s: 0, l: 45.1 }
}

// Theme presets
export const themePresets: Record<string, { light: ThemeColors; dark: ThemeColors }> = {
  default: {
    light: {
      primary: { h: 38, s: 92, l: 50 },
      secondary: { h: 220, s: 14, l: 96 },
      accent: { h: 38, s: 92, l: 50 },
      muted: { h: 0, s: 0, l: 96.1 },
      destructive: { h: 0, s: 84.2, l: 60.2 },
      background: { h: 0, s: 0, l: 100 },
      card: { h: 0, s: 0, l: 100 },
      popover: { h: 0, s: 0, l: 100 },
      border: { h: 0, s: 0, l: 89.8 },
      radius: 0.5,
    },
    dark: {
      primary: { h: 38, s: 92, l: 50 },
      secondary: { h: 0, s: 0, l: 14.9 },
      accent: { h: 38, s: 92, l: 50 },
      muted: { h: 0, s: 0, l: 14.9 },
      destructive: { h: 0, s: 62.8, l: 30.6 },
      background: { h: 0, s: 0, l: 3.9 },
      card: { h: 0, s: 0, l: 7 },
      popover: { h: 0, s: 0, l: 7 },
      border: { h: 0, s: 0, l: 14.9 },
      radius: 0.5,
    },
  },
  ocean: {
    light: {
      primary: { h: 210, s: 80, l: 50 },
      secondary: { h: 210, s: 20, l: 96 },
      accent: { h: 190, s: 75, l: 45 },
      muted: { h: 210, s: 10, l: 96 },
      destructive: { h: 0, s: 84, l: 60 },
      background: { h: 210, s: 20, l: 99 },
      card: { h: 210, s: 20, l: 100 },
      popover: { h: 210, s: 20, l: 100 },
      border: { h: 210, s: 15, l: 90 },
      radius: 0.5,
    },
    dark: {
      primary: { h: 210, s: 80, l: 55 },
      secondary: { h: 210, s: 20, l: 15 },
      accent: { h: 190, s: 75, l: 50 },
      muted: { h: 210, s: 15, l: 15 },
      destructive: { h: 0, s: 63, l: 31 },
      background: { h: 210, s: 30, l: 5 },
      card: { h: 210, s: 25, l: 8 },
      popover: { h: 210, s: 25, l: 8 },
      border: { h: 210, s: 20, l: 15 },
      radius: 0.5,
    },
  },
  forest: {
    light: {
      primary: { h: 142, s: 70, l: 40 },
      secondary: { h: 142, s: 15, l: 95 },
      accent: { h: 160, s: 60, l: 35 },
      muted: { h: 142, s: 10, l: 96 },
      destructive: { h: 0, s: 84, l: 60 },
      background: { h: 80, s: 10, l: 99 },
      card: { h: 80, s: 10, l: 100 },
      popover: { h: 80, s: 10, l: 100 },
      border: { h: 142, s: 10, l: 88 },
      radius: 0.75,
    },
    dark: {
      primary: { h: 142, s: 70, l: 50 },
      secondary: { h: 142, s: 15, l: 15 },
      accent: { h: 160, s: 60, l: 45 },
      muted: { h: 142, s: 10, l: 15 },
      destructive: { h: 0, s: 63, l: 31 },
      background: { h: 142, s: 20, l: 5 },
      card: { h: 142, s: 15, l: 8 },
      popover: { h: 142, s: 15, l: 8 },
      border: { h: 142, s: 15, l: 15 },
      radius: 0.75,
    },
  },
  sunset: {
    light: {
      primary: { h: 15, s: 85, l: 55 },
      secondary: { h: 30, s: 20, l: 95 },
      accent: { h: 35, s: 90, l: 50 },
      muted: { h: 30, s: 10, l: 96 },
      destructive: { h: 0, s: 84, l: 60 },
      background: { h: 40, s: 30, l: 99 },
      card: { h: 40, s: 25, l: 100 },
      popover: { h: 40, s: 25, l: 100 },
      border: { h: 30, s: 15, l: 88 },
      radius: 0.5,
    },
    dark: {
      primary: { h: 15, s: 85, l: 55 },
      secondary: { h: 30, s: 15, l: 15 },
      accent: { h: 35, s: 90, l: 55 },
      muted: { h: 30, s: 10, l: 15 },
      destructive: { h: 0, s: 63, l: 31 },
      background: { h: 15, s: 20, l: 5 },
      card: { h: 15, s: 15, l: 8 },
      popover: { h: 15, s: 15, l: 8 },
      border: { h: 30, s: 15, l: 15 },
      radius: 0.5,
    },
  },
  rose: {
    light: {
      primary: { h: 340, s: 75, l: 55 },
      secondary: { h: 340, s: 20, l: 96 },
      accent: { h: 320, s: 65, l: 50 },
      muted: { h: 340, s: 10, l: 96 },
      destructive: { h: 0, s: 84, l: 60 },
      background: { h: 340, s: 15, l: 99 },
      card: { h: 340, s: 15, l: 100 },
      popover: { h: 340, s: 15, l: 100 },
      border: { h: 340, s: 12, l: 90 },
      radius: 0.625,
    },
    dark: {
      primary: { h: 340, s: 75, l: 60 },
      secondary: { h: 340, s: 15, l: 15 },
      accent: { h: 320, s: 65, l: 55 },
      muted: { h: 340, s: 10, l: 15 },
      destructive: { h: 0, s: 63, l: 31 },
      background: { h: 340, s: 20, l: 5 },
      card: { h: 340, s: 15, l: 8 },
      popover: { h: 340, s: 15, l: 8 },
      border: { h: 340, s: 15, l: 15 },
      radius: 0.625,
    },
  },
  midnight: {
    light: {
      primary: { h: 260, s: 60, l: 45 },
      secondary: { h: 260, s: 15, l: 95 },
      accent: { h: 280, s: 55, l: 50 },
      muted: { h: 260, s: 10, l: 96 },
      destructive: { h: 0, s: 84, l: 60 },
      background: { h: 260, s: 10, l: 99 },
      card: { h: 260, s: 10, l: 100 },
      popover: { h: 260, s: 10, l: 100 },
      border: { h: 260, s: 10, l: 90 },
      radius: 0.375,
    },
    dark: {
      primary: { h: 260, s: 60, l: 55 },
      secondary: { h: 260, s: 15, l: 15 },
      accent: { h: 280, s: 55, l: 55 },
      muted: { h: 260, s: 10, l: 15 },
      destructive: { h: 0, s: 63, l: 31 },
      background: { h: 260, s: 30, l: 4 },
      card: { h: 260, s: 25, l: 7 },
      popover: { h: 260, s: 25, l: 7 },
      border: { h: 260, s: 20, l: 15 },
      radius: 0.375,
    },
  },
}

// Generate CSS variables string for export
export function generateCSSVariables(colors: ThemeColors, isDark: boolean = false): string {
  const prefix = isDark ? ".dark" : ":root"
  const foreground = getForegroundColor(colors.background)
  const cardForeground = getForegroundColor(colors.card)
  const popoverForeground = getForegroundColor(colors.popover)
  const primaryForeground = getForegroundColor(colors.primary)
  const secondaryForeground = getForegroundColor(colors.secondary)
  const mutedForeground = getMutedForeground(colors.background)
  const accentForeground = getForegroundColor(colors.accent)
  const destructiveForeground = getForegroundColor(colors.destructive)

  return `${prefix} {
    --background: ${hslToString(colors.background)};
    --foreground: ${hslToString(foreground)};
    --card: ${hslToString(colors.card)};
    --card-foreground: ${hslToString(cardForeground)};
    --popover: ${hslToString(colors.popover)};
    --popover-foreground: ${hslToString(popoverForeground)};
    --primary: ${hslToString(colors.primary)};
    --primary-foreground: ${hslToString(primaryForeground)};
    --secondary: ${hslToString(colors.secondary)};
    --secondary-foreground: ${hslToString(secondaryForeground)};
    --muted: ${hslToString(colors.muted)};
    --muted-foreground: ${hslToString(mutedForeground)};
    --accent: ${hslToString(colors.accent)};
    --accent-foreground: ${hslToString(accentForeground)};
    --destructive: ${hslToString(colors.destructive)};
    --destructive-foreground: ${hslToString(destructiveForeground)};
    --border: ${hslToString(colors.border)};
    --input: ${hslToString(colors.border)};
    --ring: ${hslToString(colors.primary)};
    --radius: ${colors.radius}rem;
  }`
}

// Generate full CSS export
export function generateFullCSS(lightColors: ThemeColors, darkColors: ThemeColors): string {
  return `@layer base {
${generateCSSVariables(lightColors, false)}
${generateCSSVariables(darkColors, true)}
}`
}
