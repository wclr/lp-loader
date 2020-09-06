import webpack from 'webpack'
import { makeConfig } from './webpack.config'
import http from 'http'
import { join } from 'path'
const staticServer = require('node-static').Server

const compiler = webpack(makeConfig(true))

compiler.watch({ poll: 100 }, (err, stats) => {
  if (stats) {
    console.log(stats.toJson('minimal'))
  }
})

const file = new staticServer(join(__dirname + '/build'))
console.log('Static HTTP server is listenting on', process.env.PORT)
http
  .createServer((request, response) => {
    request
      .addListener('end', function () {
        file.serve(request, response)
      })
      .resume()
  })
  .listen(process.env.PORT)
