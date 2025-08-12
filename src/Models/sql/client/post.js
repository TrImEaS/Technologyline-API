const { ADMINPool } = require('../config.js')
const { readJsonFile, writeJsonFile } = require('../../../Utils/handle_json.js')

const path = require('path')
const clientPath = path.resolve(__dirname, '../../../Data/clients.json')

exports.addClient = async function ({ input }) {
  try {
    const [exists] = await ADMINPool.query('SELECT fullname from client_ecommerce WHERE email = ?', [input.email])
    if (exists.length > 0) {
      return false
    }

    const [results] = await ADMINPool.query(
      'INSERT INTO `client_ecommerce`(`fullname`, `nickname`, `email`, `dni`, `address`, `password`) VALUES (?, ?, ?, ?, ?, ?)',
      [input.fullname, input.nickname, input.email, input.dni, input.address, input.password])
    const data = results

    return data
  } catch (error) {
    console.error('Error fetching resellers form_data:', error)
    throw error
  }
}

exports.addSubscriber = async function ({ input }) {
  try {
    const jsonData = await readJsonFile(clientPath)

    const existingData = jsonData.find(data => data.email === input.email)
    if (existingData) { return false }

    jsonData.push(input)

    await writeJsonFile(clientPath, jsonData)

    console.log('New email pushed')
    return input
  } catch (error) {
    console.error('Error pushing email:', error)
    throw error
  }
}
