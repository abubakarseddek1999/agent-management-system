const csv = require("csv-parser")
const XLSX = require("xlsx")
const { Readable } = require("stream")

// Process CSV file
const processCsvFile = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = []
    const errors = []

    const stream = Readable.from(buffer.toString())

    stream
      .pipe(csv())
      .on("data", (data, index) => {
        try {
          // Validate required fields
          const row = {
            firstName: data.FirstName || data.firstName || data["First Name"] || "",
            phone: data.Phone || data.phone || data.PhoneNumber || data["Phone Number"] || "",
            notes: data.Notes || data.notes || data.Note || data.note || "",
          }

          // Validate data
          if (!row.firstName.trim()) {
            errors.push({
              row: index + 2, // +2 because CSV starts from row 1 and we skip header
              field: "firstName",
              message: "First name is required",
            })
          }

          if (!row.phone.trim()) {
            errors.push({
              row: index + 2,
              field: "phone",
              message: "Phone number is required",
            })
          }

          // Validate phone number format
          if (row.phone && !/^\+?[1-9]\d{1,14}$/.test(row.phone.replace(/[\s-()]/g, ""))) {
            errors.push({
              row: index + 2,
              field: "phone",
              message: "Invalid phone number format",
            })
          }

          // Clean phone number
          if (row.phone) {
            row.phone = row.phone.replace(/[\s-()]/g, "")
            if (!row.phone.startsWith("+")) {
              row.phone = "+" + row.phone
            }
          }

          results.push(row)
        } catch (error) {
          errors.push({
            row: index + 2,
            field: "general",
            message: error.message,
          })
        }
      })
      .on("end", () => {
        resolve({ data: results, errors })
      })
      .on("error", (error) => {
        reject(error)
      })
  })
}

// Process Excel file
const processExcelFile = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    const results = []
    const errors = []

    jsonData.forEach((data, index) => {
      try {
        const row = {
          firstName: data.FirstName || data.firstName || data["First Name"] || "",
          phone: data.Phone || data.phone || data.PhoneNumber || data["Phone Number"] || "",
          notes: data.Notes || data.notes || data.Note || data.note || "",
        }

        // Validate data
        if (!row.firstName.toString().trim()) {
          errors.push({
            row: index + 2,
            field: "firstName",
            message: "First name is required",
          })
        }

        if (!row.phone.toString().trim()) {
          errors.push({
            row: index + 2,
            field: "phone",
            message: "Phone number is required",
          })
        }

        // Convert to string and validate phone
        row.phone = row.phone.toString().replace(/[\s-()]/g, "")
        if (row.phone && !/^\+?[1-9]\d{1,14}$/.test(row.phone)) {
          errors.push({
            row: index + 2,
            field: "phone",
            message: "Invalid phone number format",
          })
        }

        // Clean phone number
        if (row.phone && !row.phone.startsWith("+")) {
          row.phone = "+" + row.phone
        }

        // Convert firstName and notes to string
        row.firstName = row.firstName.toString().trim()
        row.notes = row.notes.toString().trim()

        results.push(row)
      } catch (error) {
        errors.push({
          row: index + 2,
          field: "general",
          message: error.message,
        })
      }
    })

    return { data: results, errors }
  } catch (error) {
    throw new Error("Failed to process Excel file: " + error.message)
  }
}

// Distribute data among agents
const distributeDataAmongAgents = (data, agents) => {
  if (!agents || agents.length === 0) {
    throw new Error("No active agents available for distribution")
  }

  const distribution = []
  const itemsPerAgent = Math.floor(data.length / agents.length)
  const remainingItems = data.length % agents.length

  let currentIndex = 0

  agents.forEach((agent, agentIndex) => {
    const itemsForThisAgent = itemsPerAgent + (agentIndex < remainingItems ? 1 : 0)
    const agentData = data.slice(currentIndex, currentIndex + itemsForThisAgent)

    distribution.push({
      agent: agent,
      data: agentData,
      count: agentData.length,
    })

    currentIndex += itemsForThisAgent
  })

  return distribution
}

module.exports = {
  processCsvFile,
  processExcelFile,
  distributeDataAmongAgents,
}
