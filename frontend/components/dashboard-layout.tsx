"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, Upload, LogOut, User } from "lucide-react"
import { DistributionView } from "./distribution-view"
import { AgentManagement } from "./agent-management"
import { CsvUpload } from "./csv-upload"
import { apiService } from "@/lib/api-service"

interface DashboardLayoutProps {
  onLogout: () => void
}

export function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const currentUser = apiService.getCurrentUser()

  const handleLogout = async () => {
    await apiService.logout()
    onLogout()
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="border-b bg-card backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-slide-in-left">
              <h1 className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-300">
                Agent Management System
              </h1>
              <p className="text-sm text-muted-foreground">MERN Stack Dashboard</p>
            </div>
            <div className="flex items-center gap-4 animate-slide-in-right">
              {currentUser && (
                <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-2 rounded-lg hover-lift">
                  <User className="h-4 w-4 text-primary" />
                  <span>{currentUser.name || currentUser.email}</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover-lift focus-ring transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm animate-scale-in">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 transition-all duration-300 hover-lift data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="h-4 w-4 animate-bounce-subtle" />
              Distribution Overview
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="flex items-center gap-2 transition-all duration-300 hover-lift data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4" />
              Agent Management
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="flex items-center gap-2 transition-all duration-300 hover-lift data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-fade-in-up">
            <DistributionView />
          </TabsContent>

          <TabsContent value="agents" className="animate-fade-in-up">
            <AgentManagement />
          </TabsContent>

          <TabsContent value="upload" className="animate-fade-in-up">
            <CsvUpload />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-12 transition-all duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground animate-fade-in-up">
            <p className="hover:text-primary transition-colors duration-300">
              Agent Management System - Built with MERN Stack
            </p>
            <p className="mt-1 flex items-center justify-center gap-2 flex-wrap">
              <span className="hover:text-chart-1 transition-colors duration-300 cursor-default">MongoDB</span>
              <span>•</span>
              <span className="hover:text-chart-2 transition-colors duration-300 cursor-default">Express.js</span>
              <span>•</span>
              <span className="hover:text-chart-3 transition-colors duration-300 cursor-default">React/Next.js</span>
              <span>•</span>
              <span className="hover:text-chart-4 transition-colors duration-300 cursor-default">Node.js</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
