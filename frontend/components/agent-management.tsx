"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Mail, Phone, Trash2, Edit, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { agentService, type Agent } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  })

  const loadAgents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await agentService.getAgents()
      setAgents(data)
    } catch (error) {
      console.error("Failed to load agents:", error)
      setError(error instanceof Error ? error.message : "Failed to load agents")
      toast({
        title: "Error Loading Agents",
        description: error instanceof Error ? error.message : "Failed to load agents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setError("All fields are required")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      if (editingAgent) {
        // Update existing agent - only send password if it's provided
        const updateData = {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          ...(formData.password && { password: formData.password }),
        }
        await agentService.updateAgent(editingAgent._id, updateData)
        setIsEditDialogOpen(false)
        setEditingAgent(null)
        toast({
          title: "Agent Updated Successfully",
          description: `${formData.name} has been updated successfully.`,
        })
      } else {
        // Add new agent
        await agentService.addAgent(formData)
        setIsAddDialogOpen(false)
        toast({
          title: "Agent Added Successfully",
          description: `${formData.name} has been added to your team.`,
        })
      }

      setFormData({ name: "", email: "", mobile: "", password: "" })
      await loadAgents()
    } catch (error) {
      console.error("Failed to save agent:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save agent"
      setError(errorMessage)
      toast({
        title: editingAgent ? "Failed to Update Agent" : "Failed to Add Agent",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      password: "", // Don't pre-fill password for security
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (agentId: string) => {
    const agent = agents.find((a) => a._id === agentId)
    if (!confirm(`Are you sure you want to delete ${agent?.name || "this agent"}?`)) return

    try {
      setError(null)
      await agentService.deleteAgent(agentId)
      await loadAgents()
      toast({
        title: "Agent Deleted",
        description: `${agent?.name || "Agent"} has been removed from your team.`,
      })
    } catch (error) {
      console.error("Failed to delete agent:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete agent"
      setError(errorMessage)
      toast({
        title: "Failed to Delete Agent",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", mobile: "", password: "" })
    setError(null)
    setEditingAgent(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in-up">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20"></div>
        </div>
        <span className="ml-2 mt-4 text-lg font-medium animate-pulse">Loading agents...</span>
        <div className="mt-2 flex space-x-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Agent Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage your team of agents</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="hover-lift animate-pulse-glow focus-ring transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
              <Plus className="h-4 w-4 mr-2 animate-bounce-subtle" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="animate-scale-in">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Add New Agent
              </DialogTitle>
              <DialogDescription>Create a new agent account with login credentials</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 stagger-children">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Agent full name"
                  required
                  className="focus-ring hover:border-primary/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="agent@example.com"
                  required
                  className="focus-ring hover:border-primary/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+1234567890"
                  required
                  className="focus-ring hover:border-primary/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Secure password"
                  required
                  className="focus-ring hover:border-primary/50 transition-all duration-300"
                />
              </div>
              {error && (
                <Alert variant="destructive" className="animate-scale-in border-destructive/50 bg-destructive/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="hover-lift transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="hover-lift transition-all duration-300 bg-gradient-to-r from-primary to-secondary"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Add Agent
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-scale-in border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <Card className="hover-lift transition-all duration-500 hover:shadow-xl hover:border-primary/20 group">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                <Users className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-3xl font-bold text-primary animate-bounce-subtle">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift transition-all duration-500 hover:shadow-xl hover:border-secondary/20 group">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors duration-300">
                <CheckCircle className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-3xl font-bold text-secondary animate-bounce-subtle">
                  {agents.filter((a) => a.isActive !== false).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-lift transition-all duration-500 hover:shadow-xl hover:border-accent/20 group">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors duration-300">
                <Plus className="h-6 w-6 text-accent group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent Additions</p>
                <p className="text-3xl font-bold text-accent animate-bounce-subtle">
                  {
                    agents.filter((a) => {
                      const createdAt = new Date(a.createdAt || Date.now())
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      return createdAt > weekAgo
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift transition-all duration-300 animate-slide-in-right">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Agents
          </CardTitle>
          <CardDescription>Manage your team members and their access</CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                <Users className="h-12 w-12 text-muted-foreground animate-bounce-subtle" />
              </div>
              <p className="text-xl font-medium text-muted-foreground mb-2">No agents found</p>
              <p className="text-sm text-muted-foreground">Add your first agent to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Mobile</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent, index) => (
                    <TableRow
                      key={agent._id}
                      className="hover:bg-muted/50 transition-all duration-300 group animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <TableCell className="font-medium group-hover:text-primary transition-colors duration-300">
                        {agent.name}
                      </TableCell>
                      <TableCell className="group-hover:text-foreground transition-colors duration-300">
                        {agent.email}
                      </TableCell>
                      <TableCell className="group-hover:text-foreground transition-colors duration-300">
                        {agent.mobile}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={agent.isActive !== false ? "default" : "secondary"}
                          className="transition-all duration-300 hover:scale-105"
                        >
                          {agent.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="group-hover:text-foreground transition-colors duration-300">
                        {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2  opacity-100 transition-opacity duration-300">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(agent)}
                            className="hover-lift hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(agent._id)}
                            className="text-destructive bg-destructive/10 border-destructive/50 transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Agent
            </DialogTitle>
            <DialogDescription>Update agent information and credentials</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 stagger-children">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Agent full name"
                required
                className="focus-ring hover:border-primary/50 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="agent@example.com"
                required
                className="focus-ring hover:border-primary/50 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mobile" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Mobile Number
              </Label>
              <Input
                id="edit-mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+1234567890"
                required
                className="focus-ring hover:border-primary/50 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                New Password (leave blank to keep current)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="New password (optional)"
                className="focus-ring hover:border-primary/50 transition-all duration-300"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="animate-scale-in border-destructive/50 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="hover-lift transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="hover-lift transition-all duration-300 bg-gradient-to-r from-primary to-secondary"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Update Agent
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
