const mongoose = require("mongoose")

const uploadBatchSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    totalRecords: {
      type: Number,
      required: [true, "Total records count is required"],
      min: [0, "Total records cannot be negative"],
    },
    processedRecords: {
      type: Number,
      default: 0,
      min: [0, "Processed records cannot be negative"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
uploadBatchSchema.index({ uploadedBy: 1 })
uploadBatchSchema.index({ status: 1 })

module.exports = mongoose.model("UploadBatch", uploadBatchSchema)
