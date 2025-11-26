"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DesignSystemDemo() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-wedx-primary">
          wedX Design System Demo
        </h1>
        <p className="text-muted-foreground">
          This page demonstrates the wedX design system with shadcn/ui
          components using wedX color tokens.
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Component Showcase</CardTitle>
          <CardDescription>
            Interactive demo of wedX themed components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="buttons" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="dialog">Dialog</TabsTrigger>
            </TabsList>

            <TabsContent value="buttons" className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </TabsContent>

            <TabsContent value="forms" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full max-w-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="cards" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Card</CardTitle>
                    <CardDescription>
                      A sample card demonstrating wedX theming
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card uses wedX neutral colors and follows the design
                      system spacing.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Another Card</CardTitle>
                    <CardDescription>
                      Demonstrating consistent styling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      All cards maintain consistent borders, shadows, and
                      typography.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dialog" className="space-y-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sample Dialog</DialogTitle>
                    <DialogDescription>
                      This is a demonstration of the wedX dialog component with
                      proper theming.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm">
                      Dialogs use wedX color tokens and follow accessibility
                      best practices.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>wedX Color Tokens</CardTitle>
          <CardDescription>
            Visual representation of wedX design system colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-medium">Primary (Coral)</h4>
              <div className="space-y-1">
                <div className="h-8 bg-wedx-primary-500 rounded"></div>
                <div className="h-8 bg-wedx-primary-600 rounded"></div>
                <div className="h-8 bg-wedx-primary-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Accent (Gold)</h4>
              <div className="space-y-1">
                <div className="h-8 bg-wedx-accent-500 rounded"></div>
                <div className="h-8 bg-wedx-accent-600 rounded"></div>
                <div className="h-8 bg-wedx-accent-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Support (Teal)</h4>
              <div className="space-y-1">
                <div className="h-8 bg-wedx-support-500 rounded"></div>
                <div className="h-8 bg-wedx-support-600 rounded"></div>
                <div className="h-8 bg-wedx-support-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Neutral</h4>
              <div className="space-y-1">
                <div className="h-8 bg-wedx-neutral-200 rounded"></div>
                <div className="h-8 bg-wedx-neutral-400 rounded"></div>
                <div className="h-8 bg-wedx-neutral-600 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
