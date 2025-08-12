const fs = require('fs')

async function readJsonFile (path) {
  try {
    const rawData = await fs.promises.readFile(path)
    return JSON.parse(rawData)
  } catch (error) {
    console.error('Error reading JSON file:', error)
    return []
  }
}

async function writeJsonFile (path, data) {
  try {
    await fs.promises.writeFile(path, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing JSON file:', error)
    throw error
  }
}

module.exports = { readJsonFile, writeJsonFile }
