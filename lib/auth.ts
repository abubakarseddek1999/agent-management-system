export interface User {
  id: string
  email: string
  name: string
}

export interface Agent {
  id: string
  name: string
  email: string
  mobile: string
  password: string
  createdAt: string
}

export interface ListItem {
  id: string
  firstName: string
  phone: string
  notes: string
  agentId: string
  createdAt: string
}

// Default admin user for demo purposes
const DEFAULT_ADMIN = {
  id: "1",
  email: "admin@example.com",
  password: "admin123",
  name: "Admin User",
}

export const authService = {
  // Initialize default admin if not exists
  initializeAuth: () => {
    const users = localStorage.getItem("users")
    if (!users) {
      localStorage.setItem("users", JSON.stringify([DEFAULT_ADMIN]))
    }
  },

  // Login function
  login: (email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      return userWithoutPassword
    }
    return null
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  },

  // Logout
  logout: () => {
    localStorage.removeItem("currentUser")
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("currentUser")
  },
}

export const agentService = {
  // Get all agents
  getAgents: (): Agent[] => {
    return JSON.parse(localStorage.getItem("agents") || "[]")
  },

  // Add new agent
  addAgent: (agent: Omit<Agent, "id" | "createdAt">): Agent => {
    const agents = agentService.getAgents()
    const newAgent: Agent = {
      ...agent,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    agents.push(newAgent)
    localStorage.setItem("agents", JSON.stringify(agents))
    return newAgent
  },

  // Delete agent
  deleteAgent: (id: string): void => {
    const agents = agentService.getAgents().filter((agent) => agent.id !== id)
    localStorage.setItem("agents", JSON.stringify(agents))
  },
}

export const listService = {
  // Get all list items
  getListItems: (): ListItem[] => {
    return JSON.parse(localStorage.getItem("listItems") || "[]")
  },

  // Add list items
  addListItems: (items: Omit<ListItem, "id" | "createdAt">[]): ListItem[] => {
    const existingItems = listService.getListItems()
    const newItems: ListItem[] = items.map((item) => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }))

    const allItems = [...existingItems, ...newItems]
    localStorage.setItem("listItems", JSON.stringify(allItems))
    return newItems
  },

  // Get items by agent
  getItemsByAgent: (agentId: string): ListItem[] => {
    return listService.getListItems().filter((item) => item.agentId === agentId)
  },

  // Clear all list items
  clearListItems: (): void => {
    localStorage.setItem("listItems", JSON.stringify([]))
  },
}
