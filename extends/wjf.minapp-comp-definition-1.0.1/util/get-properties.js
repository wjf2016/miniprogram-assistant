const recast = require('recast')
const fs = require('fs')

function getProperties(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const ast = recast.parse(code)
  let result

  recast.visit(ast, {
    visitCallExpression(path) {
      const { node } = path
      if (node.callee.name === 'Component') {
        const [argument] = node.arguments

        if (argument) {
          const { type, properties, name } = argument

          if (type === 'ObjectExpression') {
            result = findProperties(properties)
            return false
          }

          if (type === 'Identifier') {
            const properties = findVariableDeclarator(ast, name)
            result = findProperties(properties)
            return false
          }

          return false
        }

        return false
      }

      return false
    },
  })

  return result
}

function findVariableDeclarator(ast, name) {
  let result

  recast.visit(ast, {
    visitVariableDeclarator(path) {
      const { node } = path
      if (node.id.name === name && node.init.type === 'ObjectExpression') {
        result = node.init.properties
        return false
      }

      return false
    },
  })

  return result
}

function findProperties(properties) {
  let result

  for (let i = 0, item; (item = properties[i++]); ) {
    if (item.key.name === 'properties') {
      let attributes = []
      item.value.properties.forEach(property => {
        const attribute = {
          name: property.key.name, // 属性名
          description: recast.print(property).code, // 说明
        }

        attributes.push(attribute)
      })

      result = attributes
      break
    }
  }

  return result
}

module.exports = getProperties
