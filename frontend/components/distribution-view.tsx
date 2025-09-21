"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
} from "lucide-react"
import { apiService, type Agent, type ListItem, type UploadBatch } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

interface DistributionStats {
  totalItems: number
  totalAgents: number
  distribution: {
    agentId: string
    agentName: string
    assignedCount: number
    percentage: string
  }[]
}

interface TaskStatusStats {
  pending: number
  contacted: number
  completed: number
}

export function DistributionView() {
  const [distributionStats, setDistributionStats] = useState<DistributionStats | null>(null)
  const [taskStatusStats, setTaskStatusStats] = useState<TaskStatusStats | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [recentBatches, setRecentBatches] = useState<UploadBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchDistributionData = async () => {
    try {
      setRefreshing(true)

      // Fetch distribution stats
      const distStats = await apiService.getDistributionStats()
      setDistributionStats(distStats)

      // Fetch agents
      const agentsData = await apiService.getAgents()
      setAgents(agentsData)

      // Fetch recent batches
      const batchesData = await apiService.getUploadBatches()
      setRecentBatches(batchesData.slice(0, 5)) // Show only recent 5

      // Calculate task status stats
      const allItems = await apiService.getListItems()
      const statusStats = allItems.reduce(
        (acc, item: ListItem & { status?: string }) => {
          const status = item.status || "pending"
          acc[status as keyof TaskStatusStats] = (acc[status as keyof TaskStatusStats] || 0) + 1
          return acc
        },
        { pending: 0, contacted: 0, completed: 0 },
      )
      setTaskStatusStats(statusStats)
    } catch (error) {
      console.error("Error fetching distribution data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch distribution data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDistributionData()
  }, [])

  const handleRefresh = () => {
    fetchDistributionData()
    toast({
      title: "Refreshed",
      description: "Distribution data has been updated",
    })
  }

  const handleExportData = async () => {
    try {
      const allItems = await apiService.getListItems()
      const csvContent = [
        ["Agent Name", "First Name", "Phone", "Notes", "Status", "Created Date"].join(","),
        ...allItems.map((item: ListItem & { agentId: { name: string } }) =>
          [
            item.agentId?.name || "Unknown",
            item.firstName,
            item.phone,
            item.notes,
            (item as any).status || "pending",
            new Date(item.createdAt).toLocaleDateString(),
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `distribution-export-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Distribution data exported successfully",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export distribution data",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Distribution Overview</h2>
            <p className="text-muted-foreground">Monitor task distribution and agent performance</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalTasks = taskStatusStats
    ? taskStatusStats.pending + taskStatusStats.contacted + taskStatusStats.completed
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Distribution Overview</h2>
          <p className="text-muted-foreground">Monitor task distribution and agent performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributionStats?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Distributed across {distributionStats?.totalAgents || 0} agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">Currently managing tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks > 0 ? Math.round(((taskStatusStats?.completed || 0) / totalTasks) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {taskStatusStats?.completed || 0} of {totalTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentBatches.length}</div>
            <p className="text-xs text-muted-foreground">In the last batch uploads</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Agent Distribution</TabsTrigger>
          <TabsTrigger value="status">Task Status</TabsTrigger>
          <TabsTrigger value="batches">Upload History</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          {distributionStats && distributionStats.distribution.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Task Distribution by Agent
                  </CardTitle>
                  <CardDescription>How tasks are distributed among active agents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {distributionStats.distribution.map((item) => (
                    <div key={item.agentId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.agentName}</span>
                        <span className="text-muted-foreground">
                          {item.assignedCount} tasks ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={Number.parseFloat(item.percentage)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Agent Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                  <CardDescription>Individual agent task assignments and workload</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agents.map((agent) => {
                      const distribution = distributionStats.distribution.find((d) => d.agentId === agent._id)
                      const taskCount = distribution?.assignedCount || 0
                      const percentage = distribution?.percentage || "0"

                      return (
                        <div key={agent._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-muted-foreground">{agent.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{taskCount} tasks</p>
                            <p className="text-sm text-muted-foreground">{percentage}% of total</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No distribution data available. Upload some CSV files to see task distribution.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{taskStatusStats?.pending || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting contact</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <RefreshCw className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{taskStatusStats?.contacted || 0}</div>
                <p className="text-xs text-muted-foreground">Currently being handled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{taskStatusStats?.completed || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully finished</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Task completion status across all agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>
                    {taskStatusStats?.completed || 0} / {totalTasks}
                  </span>
                </div>
                <Progress
                  value={totalTasks > 0 ? ((taskStatusStats?.completed || 0) / totalTasks) * 100 : 0}
                  className="h-3"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{taskStatusStats?.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{taskStatusStats?.contacted || 0}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{taskStatusStats?.completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Upload Batches</CardTitle>
              <CardDescription>History of CSV file uploads and processing status</CardDescription>
            </CardHeader>
            <CardContent>
              {recentBatches.length > 0 ? (
                <div className="space-y-4">
                  {recentBatches.map((batch) => (
                    <div key={batch._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{batch.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(batch.createdAt).toLocaleDateString()} at{" "}
                            {new Date(batch.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{batch.totalRecords} records</p>
                          <p className="text-sm text-muted-foreground">{batch.processedRecords} processed</p>
                        </div>
                        <Badge
                          variant={
                            batch.status === "completed"
                              ? "default"
                              : batch.status === "processing"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {batch.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No upload batches found. Start by uploading a CSV file.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
