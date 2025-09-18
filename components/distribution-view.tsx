"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, FileText, BarChart3, Download, RefreshCw } from "lucide-react"
import { agentService, listService, type Agent, type ListItem } from "@/lib/auth"

interface AgentDistribution {
  agent: Agent
  items: ListItem[]
  count: number
  percentage: number
}

export function DistributionView() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [listItems, setListItems] = useState<ListItem[]>([])
  const [distribution, setDistribution] = useState<AgentDistribution[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const agentsData = agentService.getAgents()
    const itemsData = listService.getListItems()

    setAgents(agentsData)
    setListItems(itemsData)

    // Calculate distribution
    const dist: AgentDistribution[] = agentsData.map((agent) => {
      const agentItems = itemsData.filter((item) => item.agentId === agent.id)
      return {
        agent,
        items: agentItems,
        count: agentItems.length,
        percentage: itemsData.length > 0 ? (agentItems.length / itemsData.length) * 100 : 0,
      }
    })

    setDistribution(dist)
  }

  const getTotalItems = () => listItems.length

  const getAverageItemsPerAgent = () => {
    return agents.length > 0 ? Math.round(getTotalItems() / agents.length) : 0
  }

  const getDistributionBalance = () => {
    if (distribution.length === 0) return "N/A"
    const counts = distribution.map((d) => d.count)
    const min = Math.min(...counts)
    const max = Math.max(...counts)
    const difference = max - min
    return difference <= 1 ? "Balanced" : `Unbalanced (±${difference})`
  }

  // Chart data
  const chartData = distribution.map((d) => ({
    name: d.agent.name,
    items: d.count,
    email: d.agent.email,
  }))

  const pieData = distribution.map((d, index) => ({
    name: d.agent.name,
    value: d.count,
    color: `hsl(${(index * 360) / distribution.length}, 70%, 50%)`,
  }))

  const exportDistribution = () => {
    const csvContent = [
      ["Agent Name", "Email", "Items Count", "Percentage"].join(","),
      ...distribution.map((d) => [d.agent.name, d.agent.email, d.count, `${d.percentage.toFixed(1)}%`].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `distribution-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (agents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Distribution Overview</h2>
          <p className="text-muted-foreground">View how tasks are distributed among agents</p>
        </div>
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>No agents found. Please add agents first to view distribution data.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Distribution Overview</h2>
          <p className="text-muted-foreground">View how tasks are distributed among agents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportDistribution} size="sm" disabled={distribution.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{getTotalItems()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Avg per Agent</p>
                <p className="text-2xl font-bold">{getAverageItemsPerAgent()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted" />
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-lg font-bold">{getDistributionBalance()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {getTotalItems() === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            No tasks have been distributed yet. Upload a CSV file to distribute tasks among agents.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribution Summary</CardTitle>
                  <CardDescription>Items assigned to each agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {distribution.map((dist) => (
                      <div key={dist.agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{dist.agent.name}</p>
                          <p className="text-sm text-muted-foreground">{dist.agent.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {dist.count} items
                          </Badge>
                          <p className="text-sm text-muted-foreground">{dist.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Items</CardTitle>
                  <CardDescription>Latest distributed items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {listItems
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((item) => {
                        const agent = agents.find((a) => a.id === item.agentId)
                        return (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{item.firstName}</p>
                              <p className="text-sm text-muted-foreground">{item.phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{agent?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    {listItems.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No items distributed yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Items per Agent</CardTitle>
                  <CardDescription>Distribution bar chart</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="items" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribution Percentage</CardTitle>
                  <CardDescription>Pie chart view</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Distribution</CardTitle>
                <CardDescription>Complete list of all distributed items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>First Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Assigned Agent</TableHead>
                        <TableHead>Date Assigned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listItems.map((item) => {
                        const agent = agents.find((a) => a.id === item.agentId)
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.firstName}</TableCell>
                            <TableCell>{item.phone}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.notes}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{agent?.name || "Unknown"}</Badge>
                            </TableCell>
                            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  {listItems.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">No items distributed</p>
                      <p className="text-sm text-muted-foreground">Upload a CSV file to start distributing tasks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
