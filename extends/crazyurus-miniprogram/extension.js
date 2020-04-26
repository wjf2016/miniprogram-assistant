const view = require('./util/view')
const cli = require('./util/cli')

function activate(context) {
  view.activate()
  cli.activate(context)
}

module.exports = {
  activate,
}
