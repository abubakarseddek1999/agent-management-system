"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AgentManagement } from "@/components/agent-management"
import { CsvUpload } from "@/components/csv-upload"
import { DistributionView } from "@/components/distribution-view"
import { LogOut, Users, Upload, BarChart3, Activity, Clock, TrendingUp, AlertCircle, RefreshCw } from "lucide-react"
import { apiService } from "@/lib/api"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalItems: 0,
    recentUploads: 0,
    distributionBalance: "N/A",
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    updateStats()
  }, [])

  const updateStats = async () => {
    try {
      setIsLoadingStats(true)
      setError("")

      const [agents, distributionStats] = await Promise.all([
        apiService.getAgents(),
        apiService.getDistributionStats().catch(() => ({
          totalRecords: 0,
          totalAgents: 0,
          averagePerAgent: 0,
          distribution: [],
        })),
      ])

      let balance = "N/A"
      if (distributionStats.distribution && distributionStats.distribution.length > 0) {
        const counts = distributionStats.distribution.map((d: any) => d.count)
        const min = Math.min(...counts)
        const max = Math.max(...counts)
        const difference = max - min
        balance = difference <= 1 ? "Balanced" : `±${difference}`
      }

      setStats({
        totalAgents: agents.length,
        totalItems: distributionStats.totalRecords,
        recentUploads: 0,
        distributionBalance: balance,
      })
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
      setError("Failed to load dashboard statistics. Please try refreshing.")
    } finally {
      setIsLoadingStats(false)
    }
  }

  const currentUser = apiService.getCurrentUser()

  if (isLoadingStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Agent Management System</h1>
                  <p className="text-sm text-muted-foreground">Distribute tasks efficiently</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
              </div>
              <Button variant="outline" onClick={onLogout} className="flex items-center gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={updateStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Agents</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
                  <p className="text-muted-foreground">Monitor your agent management system performance</p>
                </div>
                <Button variant="outline" onClick={updateStats} disabled={isLoadingStats}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Agents</p>
                        <p className="text-2xl font-bold">{stats.totalAgents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <p className="text-2xl font-bold">{stats.totalItems}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Recent Uploads</p>
                        <p className="text-2xl font-bold">{stats.recentUploads}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-muted" />
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="text-lg font-bold">{stats.distributionBalance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("agents")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Manage Agents
                    </CardTitle>
                    <CardDescription>Add, view, and manage your agents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalAgents === 0
                        ? "No agents added yet. Click to add your first agent."
                        : `You have ${stats.totalAgents} active agents.`}
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("upload")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload CSV
                    </CardTitle>
                    <CardDescription>Upload and distribute task lists</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalItems === 0
                        ? "No items uploaded yet. Click to upload your first CSV."
                        : `${stats.totalItems} items have been distributed.`}
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("distribution")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      View Reports
                    </CardTitle>
                    <CardDescription>Analyze distribution and performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View detailed reports and analytics about task distribution.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Getting Started Guide */}
              {stats.totalAgents === 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>Follow these steps to set up your agent management system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <p className="text-sm">Add your first agent in the Agents tab</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <p className="text-sm text-muted-foreground">Upload a CSV file with tasks to distribute</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                        <p className="text-sm text-muted-foreground">View distribution reports and analytics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="agents">
            <AgentManagement />
          </TabsContent>

          <TabsContent value="upload">
            <CsvUpload />
          </TabsContent>

          <TabsContent value="distribution">
            <DistributionView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
