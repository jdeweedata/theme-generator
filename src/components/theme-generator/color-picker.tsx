"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { HSLColor, hslToHex, hexToHsl } from "@/lib/theme-utils"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  label: string
  value: HSLColor
  onChange: (color: HSLColor) => void
  className?: string
}

export function ColorPicker({
  label,
  value,
  onChange,
  className,
}: ColorPickerProps) {
  const hexValue = hslToHex(value)

  const handleHueChange = (values: number[]) => {
    onChange({ ...value, h: values[0] })
  }

  const handleSaturationChange = (values: number[]) => {
    onChange({ ...value, s: values[0] })
  }

  const handleLightnessChange = (values: number[]) => {
    onChange({ ...value, l: values[0] })
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hexToHsl(hex))
    }
  }

  // Generate gradient backgrounds for sliders
  const hueGradient = `linear-gradient(to right,
    hsl(0, ${value.s}%, ${value.l}%),
    hsl(60, ${value.s}%, ${value.l}%),
    hsl(120, ${value.s}%, ${value.l}%),
    hsl(180, ${value.s}%, ${value.l}%),
    hsl(240, ${value.s}%, ${value.l}%),
    hsl(300, ${value.s}%, ${value.l}%),
    hsl(360, ${value.s}%, ${value.l}%)
  )`

  const saturationGradient = `linear-gradient(to right,
    hsl(${value.h}, 0%, ${value.l}%),
    hsl(${value.h}, 100%, ${value.l}%)
  )`

  const lightnessGradient = `linear-gradient(to right,
    hsl(${value.h}, ${value.s}%, 0%),
    hsl(${value.h}, ${value.s}%, 50%),
    hsl(${value.h}, ${value.s}%, 100%)
  )`

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md border shadow-sm"
            style={{ backgroundColor: hexValue }}
          />
          <Input
            value={hexValue}
            onChange={handleHexChange}
            className="w-24 h-8 text-xs font-mono"
            placeholder="#000000"
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Hue Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hue</span>
            <span>{Math.round(value.h)}°</span>
          </div>
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full h-1.5 top-1/2 -translate-y-1/2"
              style={{ background: hueGradient }}
            />
            <Slider
              value={[value.h]}
              onValueChange={handleHueChange}
              min={0}
              max={360}
              step={1}
              className="relative [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-transparent [&_.bg-primary\\/20]:bg-transparent"
            />
          </div>
        </div>

        {/* Saturation Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Saturation</span>
            <span>{Math.round(value.s)}%</span>
          </div>
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full h-1.5 top-1/2 -translate-y-1/2"
              style={{ background: saturationGradient }}
            />
            <Slider
              value={[value.s]}
              onValueChange={handleSaturationChange}
              min={0}
              max={100}
              step={1}
              className="relative [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-transparent [&_.bg-primary\\/20]:bg-transparent"
            />
          </div>
        </div>

        {/* Lightness Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lightness</span>
            <span>{Math.round(value.l)}%</span>
          </div>
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full h-1.5 top-1/2 -translate-y-1/2"
              style={{ background: lightnessGradient }}
            />
            <Slider
              value={[value.l]}
              onValueChange={handleLightnessChange}
              min={0}
              max={100}
              step={1}
              className="relative [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-transparent [&_.bg-primary\\/20]:bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
