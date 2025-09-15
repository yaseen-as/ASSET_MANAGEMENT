import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DarkThemeTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Dark Theme Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>shadcn/ui Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Enter your email" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" placeholder="Enter password" />
              </div>
              
              <div className="flex space-x-2">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-background border border-border p-2 rounded">Background</div>
                <div className="bg-foreground text-background p-2 rounded">Foreground</div>
                <div className="bg-card border border-border p-2 rounded">Card</div>
                <div className="bg-muted p-2 rounded">Muted</div>
                <div className="bg-primary text-primary-foreground p-2 rounded">Primary</div>
                <div className="bg-secondary text-secondary-foreground p-2 rounded">Secondary</div>
                <div className="bg-accent text-accent-foreground p-2 rounded">Accent</div>
                <div className="bg-destructive text-destructive-foreground p-2 rounded">Destructive</div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Vite + React + TailwindCSS + shadcn/ui</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This page demonstrates the successful migration from Create React App to Vite, 
                along with the integration of TailwindCSS and shadcn/ui components in a dark theme.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted p-3 rounded">
                  <h3 className="font-semibold mb-1">✅ Vite Setup</h3>
                  <p className="text-muted-foreground">Fast development server with HMR</p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <h3 className="font-semibold mb-1">✅ TailwindCSS</h3>
                  <p className="text-muted-foreground">Utility-first CSS framework</p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <h3 className="font-semibold mb-1">✅ shadcn/ui</h3>
                  <p className="text-muted-foreground">Beautiful, accessible components</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DarkThemeTestPage;
