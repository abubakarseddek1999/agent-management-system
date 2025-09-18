const express = require("express")
const { v4: uuidv4 } = require("uuid")
const path = require("path")
const Agent = require("../models/Agent")
const CsvData = require("../models/CsvData")
const UploadBatch = require("../models/UploadBatch")
const { authenticateToken, requireAdmin } = require("../middleware/auth")
const upload = require("../middleware/upload")
const { processCsvFile, processExcelFile, distributeDataAmongAgents } = require("../utils/csvProcessor")

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)
router.use(requireAdmin)

// @route   POST /api/csv/upload
// @desc    Upload and process CSV/Excel file
// @access  Private (Admin only)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase()
    let processedData

    // Process file based on type
    if (fileExtension === ".csv") {
      processedData = await processCsvFile(req.file.buffer)
    } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
      processedData = processExcelFile(req.file.buffer)
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      })
    }

    const { data, errors } = processedData

    // Check if there's any valid data
    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid data found in the file",
        errors: errors,
      })
    }

    // Get active agents for distribution
    const activeAgents = await Agent.find({ isActive: true }).select("_id name email")

    if (activeAgents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active agents available for task distribution",
      })
    }

    // Generate batch ID
    const batchId = uuidv4()

    // Distribute data among agents
    const distribution = distributeDataAmongAgents(data, activeAgents)

    // Create upload batch record
    const uploadBatch = new UploadBatch({
      batchId,
      fileName: req.file.originalname,
      totalRecords: data.length,
      processedRecords: 0,
      failedRecords: errors.length,
      status: "processing",
      distributionSummary: distribution.map((dist) => ({
        agentId: dist.agent._id,
        agentName: dist.agent.name,
        assignedCount: dist.count,
      })),
      uploadedBy: req.user._id,
      errors: errors,
    })

    await uploadBatch.save()

    // Save distributed data to database
    const csvDataPromises = []

    distribution.forEach((dist) => {
      dist.data.forEach((item) => {
        csvDataPromises.push(
          new CsvData({
            firstName: item.firstName,
            phone: item.phone,
            notes: item.notes,
            assignedTo: dist.agent._id,
            uploadBatch: batchId,
            uploadedBy: req.user._id,
          }).save(),
        )
      })
    })

    // Execute all saves
    await Promise.all(csvDataPromises)

    // Update batch status
    uploadBatch.processedRecords = data.length
    uploadBatch.status = errors.length > 0 ? "partial" : "completed"
    await uploadBatch.save()

    res.status(200).json({
      success: true,
      message: "File processed and distributed successfully",
      data: {
        batchId,
        totalRecords: data.length,
        processedRecords: data.length,
        failedRecords: errors.length,
        distribution: distribution.map((dist) => ({
          agentId: dist.agent._id,
          agentName: dist.agent.name,
          agentEmail: dist.agent.email,
          assignedCount: dist.count,
        })),
        errors: errors.length > 0 ? errors : undefined,
      },
    })
  } catch (error) {
    console.error("CSV upload error:", error)

    // Handle multer errors
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 10MB.",
      })
    }

    if (error.message.includes("Invalid file type")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// @route   GET /api/csv/batches
// @desc    Get all upload batches with pagination
// @access  Private (Admin only)
router.get("/batches", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const totalBatches = await UploadBatch.countDocuments()

    const batches = await UploadBatch.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("uploadedBy", "email")

    res.status(200).json({
      success: true,
      data: {
        batches,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBatches / limit),
          totalBatches,
          hasNextPage: page < Math.ceil(totalBatches / limit),
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Get batches error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// @route   GET /api/csv/batches/:batchId
// @desc    Get specific batch details with distributed data
// @access  Private (Admin only)
router.get("/batches/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params

    const batch = await UploadBatch.findOne({ batchId }).populate("uploadedBy", "email")

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      })
    }

    // Get distributed data
    const distributedData = await CsvData.find({ uploadBatch: batchId })
      .populate("assignedTo", "name email")
      .sort({ createdAt: 1 })

    // Group data by agent
    const dataByAgent = distributedData.reduce((acc, item) => {
      const agentId = item.assignedTo._id.toString()
      if (!acc[agentId]) {
        acc[agentId] = {
          agent: item.assignedTo,
          data: [],
        }
      }
      acc[agentId].data.push({
        _id: item._id,
        firstName: item.firstName,
        phone: item.phone,
        notes: item.notes,
        status: item.status,
        createdAt: item.createdAt,
      })
      return acc
    }, {})

    res.status(200).json({
      success: true,
      data: {
        batch,
        distributedData: Object.values(dataByAgent),
      },
    })
  } catch (error) {
    console.error("Get batch details error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// @route   GET /api/csv/agent/:agentId/tasks
// @desc    Get tasks assigned to specific agent
// @access  Private (Admin only)
router.get("/agent/:agentId/tasks", async (req, res) => {
  try {
    const { agentId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const status = req.query.status

    // Build query
    const query = { assignedTo: agentId }
    if (status) {
      query.status = status
    }

    const totalTasks = await CsvData.countDocuments(query)

    const tasks = await CsvData.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("assignedTo", "name email")
      .populate("uploadedBy", "email")

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTasks / limit),
          totalTasks,
          hasNextPage: page < Math.ceil(totalTasks / limit),
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Get agent tasks error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// @route   PUT /api/csv/task/:taskId/status
// @desc    Update task status
// @access  Private (Admin only)
router.put("/task/:taskId/status", async (req, res) => {
  try {
    const { taskId } = req.params
    const { status } = req.body

    if (!["pending", "in-progress", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      })
    }

    const task = await CsvData.findById(taskId)

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      })
    }

    task.status = status
    await task.save()

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: {
        task,
      },
    })
  } catch (error) {
    console.error("Update task status error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// @route   GET /api/csv/stats/overview
// @desc    Get CSV processing statistics
// @access  Private (Admin only)
router.get("/stats/overview", async (req, res) => {
  try {
    const totalBatches = await UploadBatch.countDocuments()
    const totalTasks = await CsvData.countDocuments()

    // Task status distribution
    const statusStats = await CsvData.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Recent batches
    const recentBatches = await UploadBatch.find().sort({ createdAt: -1 }).limit(5).populate("uploadedBy", "email")

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalBatches,
          totalTasks,
        },
        statusStats,
        recentBatches,
      },
    })
  } catch (error) {
    console.error("Get CSV stats error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

module.exports = router
