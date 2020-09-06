import webpack from 'webpack'
import config from './webpack.config'
import WebpackDevServer from 'webpack-dev-server'
import getPort from 'get-port'

getPort().then(port => {
  new WebpackDevServer(webpack(config), {
    disableHostCheck: true,
    hot: true,
    stats: { colors: true },
    port: port,
    historyApiFallback: {
      index: 'index.html',
    },
  }).listen(port)
})
