"use client"

import * as React from "react"
import { ColorPicker } from "./color-picker"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeColors, HSLColor } from "@/lib/theme-utils"

interface ThemeControlsProps {
  colors: ThemeColors
  onColorChange: (key: keyof ThemeColors, value: HSLColor | number) => void
}

export function ThemeControls({ colors, onColorChange }: ThemeControlsProps) {
  const handleColorChange = (key: keyof ThemeColors) => (color: HSLColor) => {
    onColorChange(key, color)
  }

  const handleRadiusChange = (values: number[]) => {
    onColorChange("radius", values[0])
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Core Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Core Colors</h3>

          <ColorPicker
            label="Primary"
            value={colors.primary}
            onChange={handleColorChange("primary")}
          />

          <Separator className="my-4" />

          <ColorPicker
            label="Secondary"
            value={colors.secondary}
            onChange={handleColorChange("secondary")}
          />

          <Separator className="my-4" />

          <ColorPicker
            label="Accent"
            value={colors.accent}
            onChange={handleColorChange("accent")}
          />
        </div>

        <Separator />

        {/* State Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">State Colors</h3>

          <ColorPicker
            label="Muted"
            value={colors.muted}
            onChange={handleColorChange("muted")}
          />

          <Separator className="my-4" />

          <ColorPicker
            label="Destructive"
            value={colors.destructive}
            onChange={handleColorChange("destructive")}
          />
        </div>

        <Separator />

        {/* Background Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Background Colors</h3>

          <ColorPicker
            label="Background"
            value={colors.background}
            onChange={handleColorChange("background")}
          />

          <Separator className="my-4" />

          <ColorPicker
            label="Card"
            value={colors.card}
            onChange={handleColorChange("card")}
          />

          <Separator className="my-4" />

          <ColorPicker
            label="Border"
            value={colors.border}
            onChange={handleColorChange("border")}
          />
        </div>

        <Separator />

        {/* Border Radius */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Border Radius</h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <Label>Radius</Label>
              <span className="text-muted-foreground">{colors.radius}rem</span>
            </div>
            <Slider
              value={[colors.radius]}
              onValueChange={handleRadiusChange}
              min={0}
              max={1}
              step={0.125}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sharp</span>
              <span>Round</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
