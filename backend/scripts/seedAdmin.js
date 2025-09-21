const mongoose = require("mongoose")
const User = require("../models/User")
require("dotenv").config()

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("✅ Connected to MongoDB")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL })
    if (existingAdmin) {
      console.log("❌ Admin user already exists")
      process.exit(0)
    }

    // Create admin user
    const admin = new User({
      name: "Administrator",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    })

    await admin.save()
    console.log("✅ Admin user created successfully")
    console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`)
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`)
  } catch (error) {
    console.error("❌ Error seeding admin:", error)
  } finally {
    mongoose.connection.close()
  }
}

seedAdmin()
