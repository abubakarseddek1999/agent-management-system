const express = require("express")
const Agent = require("../models/Agent")
const ListItem = require("../models/ListItem")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true }).sort({ createdAt: -1 })

    // Calculate assigned tasks for each agent
    const agentsWithTasks = await Promise.all(
      agents.map(async (agent) => {
        const assignedTasks = await ListItem.countDocuments({ agentId: agent._id })
        return {
          ...agent.toObject(),
          assignedTasks,
        }
      }),
    )

    res.json({ data: { agents: agentsWithTasks } })
  } catch (error) {
    console.error("Get agents error:", error)
    res.status(500).json({ message: "Server error while fetching agents" })
  }
})

// @route   POST /api/agents
// @desc    Create new agent
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, mobile } = req.body

    // Validation
    if (!name || !email || !mobile) {
      return res.status(400).json({ message: "Name, email, and mobile are required" })
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email })
    if (existingAgent) {
      return res.status(400).json({ message: "Agent with this email already exists" })
    }

    const agent = new Agent({ name, email, mobile })
    await agent.save()

    res.status(201).json({ data: { agent } })
  } catch (error) {
    console.error("Create agent error:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }
    res.status(500).json({ message: "Server error while creating agent" })
  }
})

// @route   PUT /api/agents/:id
// @desc    Update agent information
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email, mobile } = req.body
    const agentId = req.params.id

    // Validation
    if (!name || !email || !mobile) {
      return res.status(400).json({ message: "Name, email, and mobile are required" })
    }

    // Check if agent exists
    const agent = await Agent.findById(agentId)
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }

    // Check if email is already taken by another agent
    if (email !== agent.email) {
      const existingAgent = await Agent.findOne({ email, _id: { $ne: agentId } })
      if (existingAgent) {
        return res.status(400).json({ message: "Email is already taken by another agent" })
      }
    }

    // Update agent
    agent.name = name
    agent.email = email
    agent.mobile = mobile
    await agent.save()

    // Get updated agent with task count
    const assignedTasks = await ListItem.countDocuments({ agentId: agent._id })
    const updatedAgent = {
      ...agent.toObject(),
      assignedTasks,
    }

    res.json({
      data: { agent: updatedAgent },
      message: "Agent updated successfully",
    })
  } catch (error) {
    console.error("Update agent error:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }
    res.status(500).json({ message: "Server error while updating agent" })
  }
})

// @route   PATCH /api/agents/:id
// @desc    Partially update agent information
// @access  Private
router.patch("/:id", auth, async (req, res) => {
  try {
    const agentId = req.params.id
    const updates = req.body

    // Check if agent exists
    const agent = await Agent.findById(agentId)
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }

    // If email is being updated, check if it's already taken
    if (updates.email && updates.email !== agent.email) {
      const existingAgent = await Agent.findOne({ email: updates.email, _id: { $ne: agentId } })
      if (existingAgent) {
        return res.status(400).json({ message: "Email is already taken by another agent" })
      }
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (key !== "_id" && key !== "createdAt" && key !== "updatedAt") {
        agent[key] = updates[key]
      }
    })

    await agent.save()

    // Get updated agent with task count
    const assignedTasks = await ListItem.countDocuments({ agentId: agent._id })
    const updatedAgent = {
      ...agent.toObject(),
      assignedTasks,
    }

    res.json({
      data: { agent: updatedAgent },
      message: "Agent updated successfully",
    })
  } catch (error) {
    console.error("Patch agent error:", error)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }
    res.status(500).json({ message: "Server error while updating agent" })
  }
})

// @route   GET /api/agents/:id
// @desc    Get single agent by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }

    // Get assigned tasks count
    const assignedTasks = await ListItem.countDocuments({ agentId: agent._id })
    const agentWithTasks = {
      ...agent.toObject(),
      assignedTasks,
    }

    res.json({ data: { agent: agentWithTasks } })
  } catch (error) {
    console.error("Get agent error:", error)
    res.status(500).json({ message: "Server error while fetching agent" })
  }
})

// @route   PUT /api/agents/:id/activate
// @desc    Reactivate a soft-deleted agent
// @access  Private
router.put("/:id/activate", auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }

    if (agent.isActive) {
      return res.status(400).json({ message: "Agent is already active" })
    }

    agent.isActive = true
    await agent.save()

    // Get updated agent with task count
    const assignedTasks = await ListItem.countDocuments({ agentId: agent._id })
    const updatedAgent = {
      ...agent.toObject(),
      assignedTasks,
    }

    res.json({
      data: { agent: updatedAgent },
      message: "Agent reactivated successfully",
    })
  } catch (error) {
    console.error("Activate agent error:", error)
    res.status(500).json({ message: "Server error while activating agent" })
  }
})

// @route   DELETE /api/agents/:id
// @desc    Delete agent (soft delete)
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }

    // Check if agent has assigned tasks
    const assignedTasks = await ListItem.countDocuments({ agentId: agent._id })
    if (assignedTasks > 0) {
      // Option to force delete and reassign tasks
      if (req.query.force === "true") {
        // Get all other active agents for reassignment
        const activeAgents = await Agent.find({ _id: { $ne: agent._id }, isActive: true })

        if (activeAgents.length === 0) {
          return res.status(400).json({
            message: "Cannot delete the last active agent with assigned tasks. Please add another agent first.",
          })
        }

        // Reassign tasks to other agents
        const tasks = await ListItem.find({ agentId: agent._id })
        for (let i = 0; i < tasks.length; i++) {
          const targetAgent = activeAgents[i % activeAgents.length]
          tasks[i].agentId = targetAgent._id
          await tasks[i].save()
        }

        // Soft delete the agent
        agent.isActive = false
        await agent.save()

        return res.json({
          message: `Agent deleted successfully. ${assignedTasks} tasks reassigned to other agents.`,
          reassignedTasks: assignedTasks,
        })
      } else {
        return res.status(400).json({
          message: `Cannot delete agent with ${assignedTasks} assigned tasks. Use ?force=true to reassign tasks automatically.`,
          assignedTasks,
        })
      }
    }

    // Soft delete
    agent.isActive = false
    await agent.save()

    res.json({ message: "Agent deleted successfully" })
  } catch (error) {
    console.error("Delete agent error:", error)
    res.status(500).json({ message: "Server error while deleting agent" })
  }
})

// @route   GET /api/agents/stats
// @desc    Get agent statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const total = await Agent.countDocuments({ isActive: true })
    const active = total // All active agents are considered active
    const tasksAssigned = await ListItem.countDocuments()

    res.json({ total, active, tasksAssigned })
  } catch (error) {
    console.error("Get agent stats error:", error)
    res.status(500).json({ message: "Server error while fetching agent statistics" })
  }
})

module.exports = router
