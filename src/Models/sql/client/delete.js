const { readJsonFile, writeJsonFile } = require('../../../Utils/handle_json.js')

const path = require('path')
const clientPath = path.resolve(__dirname, '../../../Data/clients.json')

exports.deleteSubscriptor = async function ({ id }) {
  try {
    const jsonData = await readJsonFile(clientPath)
    const updatedData = jsonData.filter(data => parseInt(data.id) !== parseInt(id))
    if (jsonData.length === updatedData.length) {
      console.log(`Client with ID ${id} not found.`)
      return false
    }

    await writeJsonFile(clientPath, updatedData)

    console.log(`Client with ID ${id} deleted successfully.`)
    return true
  } catch (error) {
    console.error('Error deleting client:', error)
    throw error
  }
}
