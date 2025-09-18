const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Agent name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^\+[1-9]\d{1,14}$/, "Please enter a valid mobile number with country code (e.g., +1234567890)"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedTasks: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
agentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
agentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
agentSchema.methods.toJSON = function () {
  const agentObject = this.toObject()
  delete agentObject.password
  return agentObject
}

module.exports = mongoose.model("Agent", agentSchema)
