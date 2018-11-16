import * as webpack from 'webpack'
import config from './webpack.config'
const WebpackDevServer = require('webpack-dev-server')

new WebpackDevServer(webpack(config), {
  disableHostCheck: true,
  hot: true,
  stats: { colors: true },
  port: process.env.PORT,
  historyApiFallback: {
    index: 'index.html',
  }
})
  .listen(process.env.PORT)
