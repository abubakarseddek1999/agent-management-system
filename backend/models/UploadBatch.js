const mongoose = require("mongoose")

const uploadBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
    },
    totalRecords: {
      type: Number,
      required: true,
      min: [1, "Total records must be at least 1"],
    },
    processedRecords: {
      type: Number,
      default: 0,
    },
    failedRecords: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed", "partial"],
      default: "processing",
    },
    distributionSummary: [
      {
        agentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Agent",
          required: true,
        },
        agentName: String,
        assignedCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    errors: [
      {
        row: Number,
        field: String,
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("UploadBatch", uploadBatchSchema)
