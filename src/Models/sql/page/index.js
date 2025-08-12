const fs = require('fs')
const path = require('path')
class PageModel {}

// por cada archivo .js (salvo el index) lee y assigna sus exports:
fs.readdirSync(__dirname)
  .filter(f => f !== 'index.js' && f.endsWith('.js'))
  .forEach(file => {
    const methods = require(path.join(__dirname, file))
    Object.assign(PageModel, methods)
  })

module.exports = PageModel
