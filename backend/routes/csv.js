const express = require("express")
const multer = require("multer")
const csv = require("csv-parser")
const stream = require("stream")
const Agent = require("../models/Agent")
const ListItem = require("../models/ListItem")
const UploadBatch = require("../models/UploadBatch")
const auth = require("../middleware/auth")
const { default: mongoose } = require("mongoose")

const router = express.Router()

// ---------- Multer memory storage for Vercel ----------
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true)
    } else {
      cb(new Error("Only CSV files are allowed"), false)
    }
  },
})

// ---------- CSV Upload ----------
router.post("/upload", auth, upload.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No CSV file uploaded" })

    const buffer = req.file.buffer
    const filename = req.file.originalname

    const batch = new UploadBatch({
      filename,
      totalRecords: 0,
      uploadedBy: req.user._id,
      batchId: new mongoose.Types.ObjectId(),
    })

    const results = []
    const errors = []

    const agents = await Agent.find({ isActive: true })
    if (!agents.length) return res.status(400).json({ message: "No active agents available" })

    let agentIndex = 0

    await new Promise((resolve, reject) => {
      const readable = new stream.Readable()
      readable._read = () => {}
      readable.push(buffer)
      readable.push(null)

      readable
        .pipe(csv())
        .on("data", (data) => {
          if (!data.firstName || !data.phone) {
            errors.push(`Row ${results.length + 1}: Missing firstName or phone`)
            return
          }

          const assignedAgent = agents[agentIndex % agents.length]
          agentIndex++

          results.push({
            firstName: data.firstName.trim(),
            phone: data.phone.trim(),
            notes: data.notes ? data.notes.trim() : "",
            agentId: assignedAgent._id,
            batchId: batch._id,
          })
        })
        .on("end", resolve)
        .on("error", reject)
    })

    if (!results.length) return res.status(400).json({ message: "No valid records", warnings: errors })

    batch.totalRecords = results.length
    await batch.save()

    // Insert items and update agent task counts
    await ListItem.insertMany(results)
    for (const agent of agents) {
      const count = await ListItem.countDocuments({ agentId: agent._id })
      agent.assignedTasks = count
      await agent.save()
    }

    batch.status = "completed"
    await batch.save()

    res.json({
      batch,
      message: `Processed ${results.length} records`,
      ...(errors.length && { warnings: errors }),
    })
  } catch (error) {
    console.error("CSV upload error:", error)
    res.status(500).json({ message: "Server error during CSV processing", error: error.message })
  }
})

// ---------- Get all list items ----------
router.get("/data", auth, async (req, res) => {
  try {
    const items = await ListItem.find().populate("agentId", "name email").sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    console.error("Get list items error:", error)
    res.status(500).json({ message: "Server error while fetching list items" })
  }
})

// ---------- Get items by agent ----------
router.get("/data/agent/:agentId", auth, async (req, res) => {
  try {
    const items = await ListItem.find({ agentId: req.params.agentId })
      .populate("agentId", "name email")
      .sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    console.error("Get agent items error:", error)
    res.status(500).json({ message: "Server error while fetching agent items" })
  }
})

// ---------- Get batch history ----------
router.get("/batches", auth, async (req, res) => {
  try {
    const batches = await UploadBatch.find().populate("uploadedBy", "name email").sort({ createdAt: -1 })
    res.json(batches)
  } catch (error) {
    console.error("Get batches error:", error)
    res.status(500).json({ message: "Server error while fetching upload batches" })
  }
})

// ---------- Clear all CSV data ----------
router.delete("/clear", auth, async (req, res) => {
  try {
    await ListItem.deleteMany({})
    await UploadBatch.deleteMany({})
    await Agent.updateMany({}, { assignedTasks: 0 })
    res.json({ message: "All CSV data cleared successfully" })
  } catch (error) {
    console.error("Clear data error:", error)
    res.status(500).json({ message: "Server error while clearing data" })
  }
})

module.exports = router
