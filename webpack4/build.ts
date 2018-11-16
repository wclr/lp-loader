import * as webpack from 'webpack'
import { makeConfig } from './webpack.config'

const conf = makeConfig(true)
const compiler = webpack(conf)

compiler.run((err, stats) => {
})