"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import {
  ExternalLink,
  Copy,
  Maximize2,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Mail,
  Bell,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface PreviewPanelProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = ["Custom", "Cards", "Dashboard", "Mail", "Pricing", "Color Palette"]

export function PreviewPanel({ activeTab, onTabChange }: PreviewPanelProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [goalValue, setGoalValue] = React.useState(350)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Tabs header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab.toLowerCase())}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
          <button className="px-2 py-1.5 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Open in</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {activeTab === "cards" && <CardsPreview date={date} setDate={setDate} goalValue={goalValue} setGoalValue={setGoalValue} />}
          {activeTab === "dashboard" && <DashboardPreview />}
          {activeTab === "custom" && <CustomPreview />}
          {activeTab === "mail" && <MailPreview />}
          {activeTab === "pricing" && <PricingPreview />}
          {activeTab === "color palette" && <ColorPalettePreview />}
        </div>
      </ScrollArea>
    </div>
  )
}

function CardsPreview({ date, setDate, goalValue, setGoalValue }: { date: Date | undefined; setDate: (date: Date | undefined) => void; goalValue: number; setGoalValue: (value: number) => void }) {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      {/* Total Revenue Card */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-3xl">$15,231.89</CardTitle>
          <p className="text-sm text-muted-foreground">+20.1% from last month</p>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-end gap-1">
            {[40, 55, 45, 60, 75, 65, 80, 70, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Card */}
      <Card className="lg:col-span-1">
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
        </CardContent>
      </Card>

      {/* Move Goal Card */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Move Goal</CardTitle>
          <CardDescription>Set your daily activity goal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setGoalValue(Math.max(0, goalValue - 10))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <div className="text-5xl font-bold">{goalValue}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Calories/Day
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setGoalValue(goalValue + 10)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1 h-16">
            {[60, 45, 70, 50, 80, 65, 75].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary rounded"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <Button className="w-full">Set Goal</Button>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Upgrade your subscription</CardTitle>
          <CardDescription>
            You are currently on the free plan. Upgrade to the pro plan to get access to all features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Evil Rabbit" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@acme.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Card Number</Label>
            <div className="grid gap-4 grid-cols-3">
              <Input placeholder="1234 1234 1234 1234" className="col-span-1" />
              <Input placeholder="MM/YY" />
              <Input placeholder="CVC" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Minutes Card */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Exercise Minutes</CardTitle>
          <CardDescription>
            Your exercise minutes are ahead of where you normally are.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end gap-1">
            {[30, 45, 35, 55, 40, 60, 50, 70, 45, 80, 55, 75].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-full"
                style={{
                  height: `${h}%`,
                  backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))`,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <Card className="w-64 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold">AI</span>
            </div>
            <span className="font-semibold">Acme Inc.</span>
          </div>

          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Quick Create
          </Button>

          <nav className="space-y-1">
            {["Dashboard", "Lifecycle", "Analytics", "Projects", "Team"].map((item) => (
              <button
                key={item}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-muted-foreground"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground mb-2">Documents</div>
            <nav className="space-y-1">
              {["Data Library", "Reports", "Word Assistant"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-muted-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </Card>

      {/* Main content */}
      <div className="flex-1 space-y-4">
        <div className="grid gap-4 grid-cols-3">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold">$1,250.00</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">New Customers</div>
            <div className="text-2xl font-bold">1,234</div>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <TrendingDown className="h-3 w-3" />
              -20%
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Active Accounts</div>
            <div className="text-2xl font-bold">45,678</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              +12%
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="font-semibold mb-2">Total Visitors</div>
          <div className="text-sm text-muted-foreground mb-4">Total for the last 3 months</div>
          <div className="h-48 flex items-end gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-primary rounded-t"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function CustomPreview() {
  return (
    <div className="space-y-8">
      {/* Buttons */}
      <div className="space-y-4">
        <h3 className="font-semibold">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-4">
        <h3 className="font-semibold">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <h3 className="font-semibold">Inputs</h3>
        <div className="grid gap-4 max-w-md">
          <Input placeholder="Enter text..." />
          <div className="flex items-center gap-2">
            <Switch id="switch" />
            <Label htmlFor="switch">Toggle me</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox" />
            <Label htmlFor="checkbox">Check me</Label>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <h3 className="font-semibold">Progress</h3>
        <div className="max-w-md space-y-2">
          <Progress value={33} />
          <Progress value={66} />
          <Progress value={100} />
        </div>
      </div>
    </div>
  )
}

function MailPreview() {
  return (
    <div className="flex gap-4">
      <Card className="w-64 p-4">
        <div className="space-y-2">
          {["Inbox", "Drafts", "Sent", "Junk", "Trash", "Archive"].map((item) => (
            <button
              key={item}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {item}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex-1">
        <Card className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary/20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">John Doe</span>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <div className="text-sm font-medium">Meeting Tomorrow</div>
                  <div className="text-sm text-muted-foreground truncate">
                    Hi, I wanted to follow up on our conversation...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function PricingPreview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { name: "Free", price: "$0", features: ["5 projects", "Basic support"] },
        { name: "Pro", price: "$29", features: ["Unlimited projects", "Priority support", "Analytics"] },
        { name: "Enterprise", price: "$99", features: ["Everything in Pro", "Custom integrations", "SLA"] },
      ].map((plan) => (
        <Card key={plan.name} className="p-6">
          <div className="text-lg font-semibold">{plan.name}</div>
          <div className="text-3xl font-bold mt-2">{plan.price}</div>
          <div className="text-sm text-muted-foreground">per month</div>
          <ul className="mt-4 space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="text-sm flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <Button className="w-full mt-6" variant={plan.name === "Pro" ? "default" : "outline"}>
            Get Started
          </Button>
        </Card>
      ))}
    </div>
  )
}

function ColorPalettePreview() {
  const colors = [
    { name: "Background", var: "--background" },
    { name: "Foreground", var: "--foreground" },
    { name: "Card", var: "--card" },
    { name: "Card Foreground", var: "--card-foreground" },
    { name: "Primary", var: "--primary" },
    { name: "Primary Foreground", var: "--primary-foreground" },
    { name: "Secondary", var: "--secondary" },
    { name: "Secondary Foreground", var: "--secondary-foreground" },
    { name: "Muted", var: "--muted" },
    { name: "Muted Foreground", var: "--muted-foreground" },
    { name: "Accent", var: "--accent" },
    { name: "Accent Foreground", var: "--accent-foreground" },
    { name: "Destructive", var: "--destructive" },
    { name: "Border", var: "--border" },
    { name: "Ring", var: "--ring" },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
      {colors.map((color) => (
        <div key={color.name} className="space-y-2">
          <div
            className="h-20 rounded-lg border"
            style={{ backgroundColor: `hsl(var(${color.var}))` }}
          />
          <div className="text-sm font-medium">{color.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{color.var}</div>
        </div>
      ))}
    </div>
  )
}
