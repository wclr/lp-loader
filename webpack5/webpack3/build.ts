import * as webpack from 'webpack'
import { makeConfig } from './webpack.config'

const compiler = webpack(makeConfig(true))

compiler.run((err, stats) => {
})