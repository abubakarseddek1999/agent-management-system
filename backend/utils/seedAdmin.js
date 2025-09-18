const User = require("../models/User")
const bcrypt = require("bcryptjs")

const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || "admin@example.com" })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    // Create admin user
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin",
    })

    await adminUser.save()
    console.log("Admin user created successfully")
    console.log(`Email: ${adminUser.email}`)
    console.log(`Password: ${process.env.ADMIN_PASSWORD || "admin123"}`)
  } catch (error) {
    console.error("Error seeding admin user:", error)
  }
}

module.exports = seedAdminUser
