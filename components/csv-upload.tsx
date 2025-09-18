"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, X, BarChart3 } from "lucide-react"
import { apiService, type Agent, type UploadBatch } from "@/lib/api"

export function CsvUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>([])
  const [distributionStats, setDistributionStats] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [agentsData, batchesData, statsData] = await Promise.all([
        apiService.getAgents(),
        apiService.getUploadBatches(),
        apiService
          .getDistributionStats()
          .catch(() => null), // Don't fail if no data
      ])

      setAgents(agentsData)
      setUploadBatches(batchesData)
      if (statsData) {
        setDistributionStats(statsData)
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
      setError("Failed to load data")
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      setUploadStatus("error")
      setError("Only CSV, XLSX, and XLS files are allowed")
      return
    }

    setFile(selectedFile)
    setUploadStatus("idle")
    setError("")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const uploadFile = async () => {
    if (!file) return

    if (agents.length === 0) {
      setError("No agents available. Please add agents first.")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const result = await apiService.uploadCsv(file)
      setUploadStatus("success")

      // Reload data to show updated stats
      await loadInitialData()

      // Clear the file input
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setUploadStatus("error")
      setError(error instanceof Error ? error.message : "Upload failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const loadDistributionStats = async () => {
    setIsLoadingStats(true)
    try {
      const stats = await apiService.getDistributionStats()
      setDistributionStats(stats)
    } catch (error) {
      console.error("Failed to load distribution stats:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const clearAllData = async () => {
    if (confirm("Are you sure you want to clear all uploaded data? This action cannot be undone.")) {
      try {
        await apiService.clearAllData()
        await loadInitialData()
        setDistributionStats(null)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to clear data")
      }
    }
  }

  const clearCurrentUpload = () => {
    setFile(null)
    setError("")
    setUploadStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">CSV Upload & Distribution</h2>
          <p className="text-muted-foreground">Upload CSV files and distribute tasks among agents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDistributionStats} disabled={isLoadingStats}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {isLoadingStats ? "Loading..." : "Refresh Stats"}
          </Button>
          {distributionStats && distributionStats.totalRecords > 0 && (
            <Button variant="destructive" onClick={clearAllData}>
              Clear All Data
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {distributionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{distributionStats.totalRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold">{distributionStats.totalAgents}</p>
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
                  <p className="text-2xl font-bold">{Math.round(distributionStats.averagePerAgent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Upload Batches</p>
                  <p className="text-2xl font-bold">{uploadBatches.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file with columns: FirstName, Phone, Notes. Supported formats: CSV, XLSX, XLS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Browse Files
              </Button>
            </div>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-card rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={uploadFile} disabled={isProcessing} size="sm">
                    {isProcessing ? "Uploading..." : "Upload & Distribute"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearCurrentUpload}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {uploadStatus === "success" && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>File uploaded and distributed successfully!</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Distribution Summary */}
      {distributionStats && distributionStats.distribution && distributionStats.distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Distribution</CardTitle>
            <CardDescription>How tasks are currently distributed among agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {distributionStats.distribution.map((dist: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{dist.agentName}</h4>
                    <Badge variant="secondary">{dist.count} items</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${distributionStats.totalRecords > 0 ? (dist.count / distributionStats.totalRecords) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload History */}
      {uploadBatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>Recent CSV upload batches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Total Records</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadBatches.map((batch) => (
                    <TableRow key={batch._id}>
                      <TableCell className="font-medium">{batch.filename}</TableCell>
                      <TableCell>{batch.totalRecords}</TableCell>
                      <TableCell>{batch.processedRecords}</TableCell>
                      <TableCell>{new Date(batch.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={batch.processedRecords === batch.totalRecords ? "default" : "secondary"}>
                          {batch.processedRecords === batch.totalRecords ? "Complete" : "Processing"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
