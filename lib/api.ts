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
  createdAt: string
  assignedTasks?: number
}

export interface ListItem {
  _id: string
  firstName: string
  phone: string
  notes: string
  agentId: string
  createdAt: string
}

export interface UploadBatch {
  _id: string
  filename: string
  totalRecords: number
  processedRecords: number
  createdAt: string
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
    console.log(data.data.token)
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

  // getCurrentUser(): User | null {
  //   const user = localStorage.getItem("currentUser")
  //   return user ? JSON.parse(user) : null
  // }
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
// Agent methods
async getAgents(): Promise<Agent[]> {
  const response = await fetch(`${API_BASE_URL}/agents`, {
    headers: this.getAuthHeaders(),
  })
  const data = await this.handleResponse(response)
  // data.data.agents হলো array
  return data.data.agents
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
  return data.data.agent  // শুধু নতুন agent return কর
}



  async deleteAgent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    await this.handleResponse(response)
  }

  async getAgentStats(): Promise<{ total: number; active: number; tasksAssigned: number }> {
    const response = await fetch(`${API_BASE_URL}/agents/stats`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // CSV/List methods
  async uploadCsv(file: File): Promise<{ batch: UploadBatch; message: string }> {
    const formData = new FormData()
    formData.append("csvFile", file)

    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/csv/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })
    return this.handleResponse(response)
  }

  async getListItems(): Promise<ListItem[]> {
    const response = await fetch(`${API_BASE_URL}/csv/data`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
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
    totalRecords: number
    totalAgents: number
    averagePerAgent: number
    distribution: Array<{ agentName: string; count: number }>
  }> {
    const response = await fetch(`${API_BASE_URL}/csv/distribution`, {
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
  addAgent: apiService.addAgent.bind(apiService),
  deleteAgent: apiService.deleteAgent.bind(apiService),
}

export const listService = {
  getListItems: apiService.getListItems.bind(apiService),
  getItemsByAgent: apiService.getItemsByAgent.bind(apiService),
  addListItems: async (items: Omit<ListItem, "_id" | "createdAt">[]): Promise<ListItem[]> => {
    // This functionality is now handled by CSV upload
    throw new Error("Use uploadCsv instead")
  },
  clearListItems: apiService.clearAllData.bind(apiService),
}
