const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface User {
  id: string
  email: string
  name: string
}

export interface Agent {
  _id: string
  name: string
  email: string
  mobile: string
  password?: string
  isActive?: boolean
  createdAt?: string
  assignedTasks?: number
}

export interface ListItem {
  _id: string
  firstName: string
  phone: string
  notes: string
  agentId: string | { name: string; email: string }
  createdAt: string
  status?: "pending" | "contacted" | "completed"
  batchId?: string
}

export interface UploadBatch {
  _id: string
  filename: string
  totalRecords: number
  processedRecords: number
  createdAt: string
  status?: "processing" | "completed" | "failed"
  uploadedBy?: string
  errorMessage?: string
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Network error" }))
      throw new Error(error.message || "Request failed")
    }
    return response.json()
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await this.handleResponse(response)
    localStorage.setItem("token", data.data.token)
    localStorage.setItem("currentUser", JSON.stringify(data.user))
    return data
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("currentUser")
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem("currentUser")
    if (!user) return null
    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token")
  }

  // Agent methods
  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      headers: this.getAuthHeaders(),
    })
    const data = await this.handleResponse(response)
    return Array.isArray(data) ? data : data.data?.agents || data.agents || []
  }

  async getAgent(id: string): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      headers: this.getAuthHeaders(),
    })
    const data = await this.handleResponse(response)
    return data.data.agent
  }

  async addAgent(agent: Omit<Agent, "_id" | "createdAt">): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(agent),
    })

    const data = await this.handleResponse(response)
    return data.data.agent
  }

  async updateAgent(id: string, agent: Partial<Omit<Agent, "_id" | "createdAt">>): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(agent),
    })
    const data = await this.handleResponse(response)
    return data.data.agent
  }

  async patchAgent(id: string, updates: Partial<Omit<Agent, "_id" | "createdAt">>): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    })
    const data = await this.handleResponse(response)
    return data.data.agent
  }

  async deleteAgent(id: string, force = false): Promise<{ message: string; reassignedTasks?: number }> {
    const url = force ? `${API_BASE_URL}/agents/${id}?force=true` : `${API_BASE_URL}/agents/${id}`
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async reactivateAgent(id: string): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/agents/${id}/activate`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
    })
    const data = await this.handleResponse(response)
    return data.data.agent
  }

  async getAgentStats(): Promise<{ total: number; active: number; tasksAssigned: number }> {
    const response = await fetch(`${API_BASE_URL}/agents/stats`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // CSV/List methods
  async uploadCsv(
    file: File,
  ): Promise<{ batch?: UploadBatch; message: string; totalItems?: number; distributedItems?: number }> {
    const formData = new FormData()
    formData.append("csvFile", file)

    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/csv/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    })
    return this.handleResponse(response)
  }

  async getListItems(): Promise<ListItem[]> {
    const response = await fetch(`${API_BASE_URL}/csv/data`, {
      headers: this.getAuthHeaders(),
    })
    const data = await this.handleResponse(response)
    return Array.isArray(data) ? data : data.data || []
  }

  async getItemsByAgent(agentId: string): Promise<ListItem[]> {
    const response = await fetch(`${API_BASE_URL}/csv/data/agent/${agentId}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async getUploadBatches(): Promise<UploadBatch[]> {
    const response = await fetch(`${API_BASE_URL}/csv/batches`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async getDistributionStats(): Promise<{
    totalItems: number
    totalAgents: number
    distribution: {
      agentId: string
      agentName: string
      assignedCount: number
      percentage: string
    }[]
  }> {
    const response = await fetch(`${API_BASE_URL}/csv/distribution`, {
      headers: this.getAuthHeaders(),
    })

    const data = await this.handleResponse(response).catch((err) => {
      console.error("Distribution API error:", err)
      // Return empty data structure on error
      return {
        totalItems: 0,
        totalAgents: 0,
        distribution: [],
      }
    })

    return data
  }

  async updateTaskStatus(taskId: string, status: "pending" | "contacted" | "completed"): Promise<ListItem> {
    const response = await fetch(`${API_BASE_URL}/csv/data/${taskId}/status`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    })
    const data = await this.handleResponse(response)
    return data.data
  }

  async getTaskAnalytics(): Promise<{
    totalTasks: number
    completionRate: number
    averageTasksPerAgent: number
    statusBreakdown: {
      pending: number
      contacted: number
      completed: number
    }
  }> {
    const response = await fetch(`${API_BASE_URL}/csv/analytics`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async clearAllData(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/csv/clear`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    await this.handleResponse(response)
  }
}

export const apiService = new ApiService()

// Legacy compatibility - keeping the same interface but using API calls
export const authService = {
  initializeAuth: () => {
    // No longer needed as backend handles initialization
  },
  login: apiService.login.bind(apiService),
  getCurrentUser: apiService.getCurrentUser.bind(apiService),
  logout: apiService.logout.bind(apiService),
  isAuthenticated: apiService.isAuthenticated.bind(apiService),
}

export const agentService = {
  getAgents: apiService.getAgents.bind(apiService),
  getAgent: apiService.getAgent.bind(apiService),
  addAgent: apiService.addAgent.bind(apiService),
  updateAgent: apiService.updateAgent.bind(apiService),
  patchAgent: apiService.patchAgent.bind(apiService),
  deleteAgent: apiService.deleteAgent.bind(apiService),
  reactivateAgent: apiService.reactivateAgent.bind(apiService),
}

export const listService = {
  getListItems: apiService.getListItems.bind(apiService),
  getItemsByAgent: apiService.getItemsByAgent.bind(apiService),
  uploadCsv: apiService.uploadCsv.bind(apiService),
  addListItems: async (items: Omit<ListItem, "_id" | "createdAt">[]): Promise<ListItem[]> => {
    // This functionality is now handled by CSV upload
    throw new Error("Use uploadCsv instead")
  },
  clearListItems: apiService.clearAllData.bind(apiService),
  updateTaskStatus: apiService.updateTaskStatus.bind(apiService),
  getTaskAnalytics: apiService.getTaskAnalytics.bind(apiService),
}
