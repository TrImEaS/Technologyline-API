const { readJsonFile } = require('../../../Utils/handle_json.js')

const path = require('path')
const clientPath = path.resolve(__dirname, '../../../Data/clients.json')
const statisticsPath = path.resolve(__dirname, '../../../Data/statistics.json')

exports.getAll = async function ({ id }) {
  const jsonData = await readJsonFile(clientPath)

  if (id) {
    return jsonData.find(data => parseInt(data.id) === parseInt(id))
  }

  return jsonData
}

exports.getNextId = async function () {
  const jsonData = await readJsonFile(clientPath)
  jsonData.sort((a, b) => b.id - a.id)

  const lastData = jsonData[0]

  const nextId = lastData ? lastData.id + 1 : 1

  return nextId
}

exports.getPageViews = async function () {
  const jsonData = await readJsonFile(statisticsPath)
  return jsonData.views
}
