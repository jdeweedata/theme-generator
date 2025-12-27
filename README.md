# Theme Generator for shadcn/ui

A powerful theme generator for [shadcn/ui](https://ui.shadcn.com/) that helps you create beautiful, accessible color themes with real-time preview.

## Live Demo

**[https://theme-generator-phi.vercel.app](https://theme-generator-phi.vercel.app)**

## Features

### Color Customization
- **HSL Color Pickers** - Fine-tune colors with Hue, Saturation, and Lightness sliders
- **37 Theme Presets** - Start with professionally designed themes including Amber Minimal, Ocean Blue, Forest Green, Violet Bloom, and more
- **Real-time Preview** - See changes instantly across all components
- **Dark/Light Mode** - Toggle between modes to customize both variants

### Typography
- **Google Fonts Integration** - Choose from popular fonts like Inter, Geist, Space Grotesk, Playfair Display, and more
- **Font Categories** - Separate controls for Sans-Serif, Serif, and Monospace fonts
- **Letter Spacing** - Fine-tune tracking from tight to loose

### Accessibility
- **WCAG 2.0 AA Contrast Checker** - Verify all color pairs meet accessibility standards
- **Pass/Fail Indicators** - Clear visual feedback for contrast ratios
- **Issue Filtering** - Quickly identify and fix accessibility issues

### Export
- **CSS Variables Output** - Copy-paste ready code for your `globals.css`
- **Multiple Formats** - Support for HSL and OKLCH color formats
- **Tailwind v3/v4** - Compatible output for both Tailwind versions
- **Package Manager Tabs** - Instructions for npm, pnpm, yarn, and bun

### Preview Components
- **Cards** - Revenue cards, calendars, goal trackers, subscription forms
- **Dashboard** - Charts, metrics, and data visualizations
- **Mail** - Email inbox interface
- **Pricing** - Pricing table layouts
- **Color Palette** - Full color swatch overview

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Fonts**: [Google Fonts](https://fonts.google.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, yarn, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jdeweedata/theme-generator.git
cd theme-generator
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Theme

1. **Select a Preset** - Click the theme dropdown in the toolbar to choose a starting point
2. **Customize Colors** - Use the Colors tab to adjust primary, secondary, accent, and other colors
3. **Adjust Typography** - Switch to the Typography tab to select fonts and letter spacing
4. **Preview** - Watch your changes in the live preview panel on the right
5. **Check Accessibility** - Click the contrast checker icon to verify WCAG compliance
6. **Export** - Click "Code" to copy your theme's CSS variables

### Exporting Your Theme

1. Click the **Code** button in the toolbar
2. Select your package manager (npm, pnpm, yarn, bun)
3. Choose Tailwind version (v3 or v4)
4. Select color format (HSL or OKLCH)
5. Copy the CSS variables to your `globals.css` file

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Global styles and CSS variables
│   ├── layout.tsx        # Root layout with fonts
│   └── page.tsx          # Main page
├── components/
│   ├── theme-generator/  # Theme generator components
│   │   ├── index.tsx     # Main component
│   │   ├── toolbar.tsx   # Top toolbar
│   │   ├── color-panel.tsx
│   │   ├── typography-panel.tsx
│   │   ├── preview-panel.tsx
│   │   ├── code-dialog.tsx
│   │   └── contrast-checker-dialog.tsx
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── theme-presets.ts  # Theme preset definitions
│   ├── theme-utils.ts    # Color conversion utilities
│   ├── contrast-utils.ts # WCAG contrast calculations
│   └── utils.ts          # General utilities
└── hooks/
    └── use-theme.ts      # Theme state management
```

## Theme Presets

| Category | Themes |
|----------|--------|
| **Minimal** | Default, Amber Minimal, Stone Minimal |
| **Blue** | Ocean Blue, Sapphire, Azure |
| **Green** | Forest Green, Emerald, Sage |
| **Purple** | Violet Bloom, Amethyst, Grape |
| **Red/Orange** | Sunset, Rose, Coral, Ruby |
| **Neutral** | Slate, Zinc, Charcoal |
| **Special** | Midnight, Cyberpunk, Retro, Pastel |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by [tweakcn](https://tweakcn.com/)
- Built with [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

Made with [Claude Code](https://claude.ai/claude-code)
