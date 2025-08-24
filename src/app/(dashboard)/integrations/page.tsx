'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SmartHomeIntegration } from '@/components/integrations/SmartHomeIntegration'
import { ThirdPartyIntegrations } from '@/components/integrations/ThirdPartyIntegrations'
import { 
  Home,
  ExternalLink,
  Settings,
  Zap
} from 'lucide-react'

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Integrasjoner</h1>
        <p className="text-muted-foreground">
          Koble til eksterne tjenester og smarte hjem-systemer
        </p>
      </div>

      <Tabs defaultValue="smart-home" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smart-home" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Smart Home
          </TabsTrigger>
          <TabsTrigger value="third-party" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Tredjeparts-tjenester
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smart-home" className="space-y-6">
          <SmartHomeIntegration />
        </TabsContent>

        <TabsContent value="third-party" className="space-y-6">
          <ThirdPartyIntegrations />
        </TabsContent>
      </Tabs>

      {/* Integration Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Integrasjonsoversikt
          </CardTitle>
          <CardDescription>
            Status for alle dine tilkoblede tjenester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Home className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Smart Home</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <ExternalLink className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-muted-foreground">Tredjeparts-tjenester</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Automatiseringer</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
