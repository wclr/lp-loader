import * as webpack from 'webpack'
import * as path from 'path'
import * as fs from 'fs'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
import { LoaderOptions } from '../src/lp-loader'
export const makeConfig = (isProduction = false) => {
  const isDevelopment = !isProduction

  process.env.LP_DEBUG = 'true'

  const appEntry = [
    path.join(__dirname, '../app/app')
  ]

  const buildDir = path.join(__dirname, 'build')
  const tsLoaderOptions = {
    compilerOptions: {
      module: "esnext",
      declaration: false,
      moduleResolution: 'node'
    }
  }
  const lpTsIndexFiles = /dict(\\|\/)index\.ts/
  const lpLoader = path.join(__dirname, '../src/lp-loader')
  const config: webpack.Configuration = {
    //mode: 'development',
    entry: {
      app: appEntry
    },
    output: {
      path: buildDir,
      filename: '[name]-[hash].js',
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: '/'
    },
    plugins: [
      //new (webpack as any).NamedModulesPlugin(),
      ...isDevelopment ? [
        new webpack.HotModuleReplacementPlugin()
      ] : [
          new CleanWebpackPlugin([buildDir], {
            root: path.resolve(__dirname, '../..')
          })
        ],
      new HtmlWebpackPlugin({
        title: 'LP-Loader ' + (isDevelopment ? 'Dev' : 'Build'),
        filename: 'index.html'
      })
    ],
    module: {
      rules: [
        {
          test: lpTsIndexFiles, loaders: [
            {
              loader: lpLoader, query: {
                name: 'language.pack',
                include: /(\\|\/)\w{2}\.ts/
              } as LoaderOptions
            },
            //{ loader: 'ts-loader', query: tsLoaderOptions } as any
            //{ loader: path.join(__dirname, 'ts-simple-loader'), query: tsLoaderOptions } as any
          ]
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          //iexclude: [lpTsIndexFiles],
          query: tsLoaderOptions
        },
        { test: /\.css$/, loader: 'style!css' },
      ]
    },
    devtool: isDevelopment ? 'eval' : 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        //'lp': path.resolve(__dirname, '../../lib/lp-loader.ts'),
      }
    },
    resolveLoader: {
      extensions: ['.ts', '.js'],
      alias: {
        //'ts': 'awesome-typescript-loader'
        //'ts': 'ts-loader'
      },
      modules: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, '../node_modules'),
        path.resolve(__dirname, '../src'),
      ]
    }
  }

  return config
}

export default makeConfig()