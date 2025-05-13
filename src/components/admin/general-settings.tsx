/**
 * File: src/components/admin/general-settings.tsx
 * 
 * General settings for the admin panel
 */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Switch } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Save, Globe, Mail, Shield, Database, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Settings {
  siteName: string
  siteDescription: string
  contactEmail: string
  allowRegistration: boolean
  requireEmailVerification: boolean
  autoApproveBusinesses: boolean
  enableAI: boolean
  maintenanceMode: boolean
}

export function GeneralSettings() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'AI Business Directory',
    siteDescription: 'Discover local businesses with AI-powered assistance',
    contactEmail: 'admin@example.com',
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveBusinesses: false,
    enableAI: true,
    maintenanceMode: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: Save settings to database
      console.log('Saving settings:', settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Settings saved',
        description: 'Your changes have been saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Site Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* User Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allowRegistration">Allow New User Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to sign up for accounts
              </p>
            </div>
            <Switch
              id="allowRegistration"
              checked={settings.allowRegistration}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, allowRegistration: value }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Users must verify their email before accessing the platform
              </p>
            </div>
            <Switch
              id="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, requireEmailVerification: value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Business Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="autoApproveBusinesses">Auto-approve Business Listings</Label>
              <p className="text-sm text-muted-foreground">
                Automatically approve new business listings without manual review
              </p>
            </div>
            <Switch
              id="autoApproveBusinesses"
              checked={settings.autoApproveBusinesses}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, autoApproveBusinesses: value }))}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enableAI">Enable AI Features</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI assistants for business interactions
              </p>
            </div>
            <Switch
              id="enableAI"
              checked={settings.enableAI}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, enableAI: value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put the site in maintenance mode (only admins can access)
              </p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, maintenanceMode: value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}