import * as webpack from 'webpack'
import * as path from 'path'
import * as fs from 'fs'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

export const makeConfig = (isProduction = false) => {
  const isDevelopment = !isProduction

  const appEntry = [
    path.resolve(__dirname, 'app')
  ]

  isDevelopment && appEntry.push(
    'webpack-dev-server/client?http://localhost:' + process.env.PORT,
    'webpack/hot/only-dev-server'
  )

  const buildDir = path.resolve('./build')
  const tsLoaderOptions = {
    compilerOptions: {
      module: "esnext",
      declaration: false,
      moduleResolution: 'node'
    }
  }
  const lpTsIndexFiles = /dict(\\|\/)index.ts/
  const config: webpack.Configuration = {
    entry: {
      app: appEntry
    },
    output: {
      path: buildDir,
      filename: '[name]-[hash].js',
      //-[chunkhash]
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: '/'
    },
    plugins: [
      new CleanWebpackPlugin([buildDir], {
        root: path.resolve(__dirname, '../..')
      }),
      new (webpack as any).NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        title: 'LP-Loader ' + (isDevelopment ? 'Dev' : 'Build'),
        filename: 'index.html'
      })
    ],
    module: {
      loaders: [        
        { test: /dict(\\|\/)index.js/, loader: 'lp-loader' },
        {
          test: lpTsIndexFiles, loaders: [
            { loader: 'lp-loader', query: { name: 'language.pack' } } as any,
            { loader: 'ts-loader', query: tsLoaderOptions } as any
          ]
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: [lpTsIndexFiles],
          query: tsLoaderOptions
        },
        { test: /\.css$/, loader: 'style!css' },
      ]
    },
    devServer: {
      disableHostCheck: true,
      hot: true,
      stats: { colors: true },
      port: process.env.PORT,
      historyApiFallback: {
        index: 'index.html',
      }
    },
    devtool: 'eval',
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        //'lp': path.resolve(__dirname, '../../lib/lp-loader.ts'),
      }
    },
    resolveLoader: <any>{
      extensions: ['.ts', '.js'],
      alias: {
        //'ts': 'awesome-typescript-loader'
        //'ts': 'ts-loader'
      },
      modules: [
        path.resolve(__dirname, '../../node_modules'),
        path.resolve(__dirname, '../node_modules'),
        path.resolve(__dirname, '../'),
      ]
    }
  }

  return config
}

export default makeConfig()