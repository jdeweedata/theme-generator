"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, Mail, Settings, User } from "lucide-react"

export function ComponentPreview() {
  const [progress, setProgress] = React.useState(45)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 5))
    }, 500)
    return () => clearInterval(timer)
  }, [])

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {/* Button Variants */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <Separator />

        {/* Card Example */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Cards</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="email-notif">Email notifications</Label>
                  </div>
                  <Switch id="email-notif" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="push-notif">Push notifications</Label>
                  </div>
                  <Switch id="push-notif" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="marketing" />
                  <Label htmlFor="marketing" className="text-sm">
                    Receive marketing emails
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Badges */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="gap-1">
              <Check className="h-3 w-3" />
              Completed
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              User
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Settings className="h-3 w-3" />
              Settings
            </Badge>
          </div>
        </section>

        <Separator />

        {/* Form Elements */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Form Elements</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="input-demo">Text Input</Label>
              <Input id="input-demo" placeholder="Type something..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-disabled">Disabled Input</Label>
              <Input id="input-disabled" placeholder="Disabled" disabled />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="check1" defaultChecked />
              <Label htmlFor="check1">Checked</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="check2" />
              <Label htmlFor="check2">Unchecked</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="switch1" defaultChecked />
              <Label htmlFor="switch1">On</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="switch2" />
              <Label htmlFor="switch2">Off</Label>
            </div>
          </div>
        </section>

        <Separator />

        {/* Progress */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage used</span>
              <span className="text-muted-foreground">75%</span>
            </div>
            <Progress value={75} />
          </div>
        </section>

        <Separator />

        {/* Color Palette Preview */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Color Palette</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            <div className="space-y-1">
              <div className="h-10 rounded-md bg-primary" />
              <p className="text-xs text-center text-muted-foreground">Primary</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 rounded-md bg-secondary" />
              <p className="text-xs text-center text-muted-foreground">Secondary</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 rounded-md bg-accent" />
              <p className="text-xs text-center text-muted-foreground">Accent</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 rounded-md bg-muted" />
              <p className="text-xs text-center text-muted-foreground">Muted</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 rounded-md bg-destructive" />
              <p className="text-xs text-center text-muted-foreground">Destructive</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 rounded-md bg-background border" />
              <p className="text-xs text-center text-muted-foreground">Background</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 rounded-md bg-card border" />
              <p className="text-xs text-center text-muted-foreground">Card</p>
            </div>
            <div className="space-y-1">
              <div className="h-10 rounded-md bg-border" />
              <p className="text-xs text-center text-muted-foreground">Border</p>
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  )
}
