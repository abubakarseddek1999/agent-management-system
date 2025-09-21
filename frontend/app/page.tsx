"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LoginForm } from "@/components/login-form"
import { Homepage } from "@/components/homepage"
import { apiService } from "@/lib/api-service"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showHomepage, setShowHomepage] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = apiService.isAuthenticated()
      setIsAuthenticated(authenticated)
      if (authenticated) {
        setShowHomepage(false)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setShowHomepage(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowHomepage(true)
  }

  const handleGetStarted = () => {
    setShowHomepage(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (showHomepage) {
    return <Homepage onGetStarted={handleGetStarted} />
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  return <DashboardLayout onLogout={handleLogout} />
}
