const ts = require('typescript')
const tsconfig = require('tsconfig')

const compilerOptions = tsconfig.loadSync(process.cwd()).config.compilerOptions

module.exports = function (source) {  
  const result = ts.transpile(source, { ...compilerOptions, ...this.query })
  return result
}
