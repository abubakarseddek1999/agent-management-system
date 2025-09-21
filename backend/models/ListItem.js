const mongoose = require("mongoose")

const listItemSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: [true, "Agent assignment is required"],
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadBatch",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
listItemSchema.index({ agentId: 1 })
listItemSchema.index({ batchId: 1 })
listItemSchema.index({ status: 1 })

module.exports = mongoose.model("ListItem", listItemSchema)
