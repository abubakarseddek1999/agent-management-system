"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, Download, Loader2 } from "lucide-react"
import { listService } from "@/lib/api-service"
import { useToast } from "@/hooks/use-toast"

interface UploadResult {
  success: boolean
  message: string
  totalItems?: number
  distributedItems?: number
  errors?: string[]
}

interface PreviewData {
  firstName: string
  phone: string
  notes: string
}

export function CsvUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [previewData, setPreviewData] = useState<PreviewData[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = [".csv", ".xlsx", ".xls"]
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf("."))

    if (!allowedTypes.includes(fileExtension)) {
      const errorMessage = "Invalid file type. Please upload CSV, XLSX, or XLS files only."
      setUploadResult({
        success: false,
        message: errorMessage,
      })
      toast({
        title: "Invalid File Type",
        description: errorMessage,
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setUploadResult(null)
    setPreviewData([])
    setShowPreview(false)

    toast({
      title: "File Selected",
      description: `${selectedFile.name} is ready for upload.`,
    })

    // Preview CSV files
    if (fileExtension === ".csv") {
      previewCsvFile(selectedFile)
    }
  }

  const previewCsvFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        const errorMessage = "CSV file must contain at least a header row and one data row."
        setUploadResult({
          success: false,
          message: errorMessage,
        })
        toast({
          title: "Invalid CSV Structure",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const requiredHeaders = ["firstname", "phone", "notes"]

      const missingHeaders = requiredHeaders.filter((header) => !headers.some((h) => h.includes(header)))

      if (missingHeaders.length > 0) {
        const errorMessage = `Missing required columns: ${missingHeaders.join(", ")}. Required: FirstName, Phone, Notes`
        setUploadResult({
          success: false,
          message: errorMessage,
        })
        toast({
          title: "Missing Required Columns",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      // Parse preview data (first 5 rows)
      const preview: PreviewData[] = []
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const firstNameIndex = headers.findIndex((h) => h.includes("firstname"))
        const phoneIndex = headers.findIndex((h) => h.includes("phone"))
        const notesIndex = headers.findIndex((h) => h.includes("notes"))

        if (firstNameIndex >= 0 && phoneIndex >= 0 && notesIndex >= 0) {
          preview.push({
            firstName: values[firstNameIndex] || "",
            phone: values[phoneIndex] || "",
            notes: values[notesIndex] || "",
          })
        }
      }

      setPreviewData(preview)
      setShowPreview(true)
      const successMessage = `File validated successfully. Found ${lines.length - 1} records ready for distribution.`
      setUploadResult({
        success: true,
        message: successMessage,
      })
      toast({
        title: "File Validated",
        description: `Found ${lines.length - 1} records ready for distribution.`,
      })
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setUploadResult(null)

      const result = await listService.uploadCsv(file)

      const successMessage = result.message || "File uploaded and distributed successfully!"
      setUploadResult({
        success: true,
        message: successMessage,
        totalItems: result.totalItems,
        distributedItems: result.distributedItems,
      })

      toast({
        title: "CSV Upload Successful",
        description: `${result.totalItems || 0} items uploaded and ${result.distributedItems || 0} distributed to agents.`,
      })

      // Clear file input
      setFile(null)
      setPreviewData([])
      setShowPreview(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Upload failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again."
      setUploadResult({
        success: false,
        message: errorMessage,
      })
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent =
      "FirstName,Phone,Notes\nJohn Doe,+1234567890,Sample notes here\nJane Smith,+0987654321,Another sample note"
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "csv-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to your device.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">CSV Upload & Distribution</h2>
          <p className="text-muted-foreground">Upload CSV files to distribute tasks among agents</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="hover:bg-primary/10 bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription>Upload CSV, XLSX, or XLS files with FirstName, Phone, and Notes columns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={uploading}
                className="hover:border-primary/50 transition-colors"
              />
              <p className="text-xs text-muted-foreground">Supported formats: CSV, XLSX, XLS (Max size: 10MB)</p>
            </div>

            {file && (
              <div className="p-3 bg-muted rounded-lg animate-fade-in-up">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{file.name}</span>
                  <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                </div>
              </div>
            )}

            {uploadResult && (
              <Alert variant={uploadResult.success ? "default" : "destructive"} className="animate-fade-in-up">
                {uploadResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>
                  {uploadResult.message}
                  {uploadResult.totalItems && (
                    <div className="mt-2 text-sm">
                      <p>Total items: {uploadResult.totalItems}</p>
                      <p>Distributed items: {uploadResult.distributedItems}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading || (uploadResult ? !uploadResult.success : false)}
                className="flex-1 animate-pulse-glow"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Distribute
                  </>
                )}
              </Button>
            </div>

            {uploading && (
              <div className="space-y-2 animate-fade-in-up">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>Please wait</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>File Requirements</CardTitle>
            <CardDescription>Ensure your file meets these requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Required Columns</p>
                  <p className="text-sm text-muted-foreground">FirstName, Phone, Notes</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Supported Formats</p>
                  <p className="text-sm text-muted-foreground">CSV, XLSX, XLS files</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Distribution Logic</p>
                  <p className="text-sm text-muted-foreground">Tasks distributed equally among all agents</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">File Size Limit</p>
                  <p className="text-sm text-muted-foreground">Maximum 10MB per file</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPreview && previewData.length > 0 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>File Preview</CardTitle>
            <CardDescription>Preview of the first 5 records from your file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{row.firstName}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell className="max-w-xs truncate">{row.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {previewData.length === 5 && (
              <p className="text-sm text-muted-foreground mt-2">Showing first 5 records. Upload to process all data.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
