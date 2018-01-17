import * as webpack from 'webpack'
import { makeConfig} from './webpack.config'
import * as http from 'http'

const staticServer = require('node-static').Server

const compiler = webpack(makeConfig(true))

compiler.watch({ poll: 100 }, (err, stats) => {  
  console.log(stats.toJson('minimal' as any))
})

const file = new staticServer('./build');
console.log('Static HTTP server is listenting on', process.env.PORT)
http.createServer((request, response) => {
  request.addListener('end', function () {      
      file.serve(request, response);
  }).resume();
}).listen(process.env.PORT)