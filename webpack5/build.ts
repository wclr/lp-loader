import webpack from 'webpack'
import { makeConfig } from './webpack.config'

const conf = makeConfig(true)
const compiler = webpack(conf)

compiler.run((err, stats) => {
  stats && console.log(stats.toString())
})