"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { apiService } from "@/lib/api"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated())
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsAuthenticated(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return <>{isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <LoginForm onLogin={handleLogin} />}</>
}
