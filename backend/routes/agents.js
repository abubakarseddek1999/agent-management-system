const express = require("express")
const { body, validationResult, param } = require("express-validator")
const Agent = require("../models/Agent")
const CsvData = require("../models/CsvData")
const { authenticateToken, requireAdmin } = require("../middleware/auth")

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)
router.use(requireAdmin)

// @route   GET /api/agents
// @desc    Get all agents with pagination and search
// @access  Private (Admin only)
router.get("/", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const search = req.query.search || ""
    const sortBy = req.query.sortBy || "createdAt"
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    // Get total count for pagination
    const totalAgents = await Agent.countDocuments(searchQuery)

    // Get agents with pagination
    const agents = await Agent.find(searchQuery)
      .sort({ [sortBy]: sortOrder })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("createdBy", "email")
      .select("-password")

    // Get task counts for each agent
    const agentsWithTaskCounts = await Promise.all(
      agents.map(async (agent) => {
        const taskCount = await CsvData.countDocuments({ assignedTo: agent._id })
        return {
          ...agent.toObject(),
          assignedTasks: taskCount,
        }
      }),
    )

    res.status(200).json({
      success: true,
      data: {
        agents: agentsWithTaskCounts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalAgents / limit),
          totalAgents,
          hasNextPage: page < Math.ceil(totalAgents / limit),
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Get agents error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// @route   GET /api/agents/:id
// @desc    Get single agent by ID
// @access  Private (Admin only)
router.get("/:id", [param("id").isMongoId().withMessage("Invalid agent ID")], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const agent = await Agent.findById(req.params.id).populate("createdBy", "email").select("-password")

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      })
    }

    // Get assigned tasks count
    const taskCount = await CsvData.countDocuments({ assignedTo: agent._id })

    res.status(200).json({
      success: true,
      data: {
        agent: {
          ...agent.toObject(),
          assignedTasks: taskCount,
        },
      },
    })
  } catch (error) {
    console.error("Get agent error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// @route   POST /api/agents
// @desc    Create new agent
// @access  Private (Admin only)
router.post(
  "/",
  [
    body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("mobile")
      .matches(/^\+[1-9]\d{1,14}$/)
      .withMessage("Please enter a valid mobile number with country code (e.g., +1234567890)"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, email, mobile, password } = req.body

      // Check if agent with email already exists
      const existingAgent = await Agent.findOne({ email })
      if (existingAgent) {
        return res.status(400).json({
          success: false,
          message: "Agent with this email already exists",
        })
      }

      // Check if agent with mobile already exists
      const existingMobile = await Agent.findOne({ mobile })
      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "Agent with this mobile number already exists",
        })
      }

      // Create new agent
      const newAgent = new Agent({
        name,
        email,
        mobile,
        password,
        createdBy: req.user._id,
      })

      await newAgent.save()

      // Return agent without password
      const agentResponse = await Agent.findById(newAgent._id).populate("createdBy", "email").select("-password")

      res.status(201).json({
        success: true,
        message: "Agent created successfully",
        data: {
          agent: agentResponse,
        },
      })
    } catch (error) {
      console.error("Create agent error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },
)

// @route   PUT /api/agents/:id
// @desc    Update agent
// @access  Private (Admin only)
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid agent ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("mobile")
      .optional()
      .matches(/^\+[1-9]\d{1,14}$/)
      .withMessage("Please enter a valid mobile number with country code"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, email, mobile, password, isActive } = req.body

      // Check if agent exists
      const agent = await Agent.findById(req.params.id)
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Agent not found",
        })
      }

      // Check for duplicate email (excluding current agent)
      if (email && email !== agent.email) {
        const existingEmail = await Agent.findOne({ email, _id: { $ne: req.params.id } })
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Agent with this email already exists",
          })
        }
      }

      // Check for duplicate mobile (excluding current agent)
      if (mobile && mobile !== agent.mobile) {
        const existingMobile = await Agent.findOne({ mobile, _id: { $ne: req.params.id } })
        if (existingMobile) {
          return res.status(400).json({
            success: false,
            message: "Agent with this mobile number already exists",
          })
        }
      }

      // Update agent fields
      if (name) agent.name = name
      if (email) agent.email = email
      if (mobile) agent.mobile = mobile
      if (password) agent.password = password
      if (typeof isActive === "boolean") agent.isActive = isActive

      await agent.save()

      // Return updated agent without password
      const updatedAgent = await Agent.findById(agent._id).populate("createdBy", "email").select("-password")

      res.status(200).json({
        success: true,
        message: "Agent updated successfully",
        data: {
          agent: updatedAgent,
        },
      })
    } catch (error) {
      console.error("Update agent error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },
)

// @route   DELETE /api/agents/:id
// @desc    Delete agent
// @access  Private (Admin only)
router.delete("/:id", [param("id").isMongoId().withMessage("Invalid agent ID")], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    // Check if agent exists
    const agent = await Agent.findById(req.params.id)
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      })
    }

    // Check if agent has assigned tasks
    const assignedTasksCount = await CsvData.countDocuments({ assignedTo: req.params.id })
    if (assignedTasksCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete agent. Agent has ${assignedTasksCount} assigned tasks. Please reassign or complete these tasks first.`,
      })
    }

    // Delete agent
    await Agent.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Agent deleted successfully",
    })
  } catch (error) {
    console.error("Delete agent error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// @route   GET /api/agents/stats/overview
// @desc    Get agents statistics overview
// @access  Private (Admin only)
router.get("/stats/overview", async (req, res) => {
  try {
    const totalAgents = await Agent.countDocuments()
    const activeAgents = await Agent.countDocuments({ isActive: true })
    const inactiveAgents = await Agent.countDocuments({ isActive: false })

    // Get task distribution
    const taskDistribution = await CsvData.aggregate([
      {
        $group: {
          _id: "$assignedTo",
          taskCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "agents",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      {
        $unwind: "$agent",
      },
      {
        $project: {
          agentName: "$agent.name",
          agentEmail: "$agent.email",
          taskCount: 1,
        },
      },
      {
        $sort: { taskCount: -1 },
      },
    ])

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAgents,
          activeAgents,
          inactiveAgents,
        },
        taskDistribution,
      },
    })
  } catch (error) {
    console.error("Get agents stats error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

module.exports = router
