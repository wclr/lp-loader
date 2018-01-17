import * as webpack from 'webpack'
import config from './webpack.config'
const WebpackDevServer = require('webpack-dev-server')

new WebpackDevServer(webpack(config), config.devServer)
  .listen(process.env.PORT)
