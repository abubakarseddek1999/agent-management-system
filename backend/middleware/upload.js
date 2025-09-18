const multer = require("multer")
const path = require("path")

// Configure multer for file upload
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = [".csv", ".xlsx", ".xls"]
  const fileExtension = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only CSV, XLSX, and XLS files are allowed."), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

module.exports = upload
