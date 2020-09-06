import * as webpack from 'webpack'
import * as path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import { LoaderOptions } from '../src/lp-loader'
export const makeConfig = (isProduction = false) => {
  const isDevelopment = !isProduction

  process.env.LP_DEBUG = 'true'

  const appEntry: webpack.Entry = [path.join(__dirname, '../app/app')]

  const buildDir = path.join(__dirname, 'build')
  const tsLoaderOptions = {
    compilerOptions: {
      module: 'esnext',
      declaration: false,
      moduleResolution: 'node',
      noEmit: false
    },
    configFile: path.join(__dirname, 'tsconfig.json'),
  }
  const lpTsIndexFiles = /dict(\\|\/)index\.ts/
  const lpLoader = path.join(__dirname, '../src/lp-loader')
  const config: webpack.Configuration = {
    mode: isProduction ? 'production' : 'development',
    entry: {
      app: appEntry,
    },
    
    output: {    
      path: buildDir,
      filename: '[name]-[fullhash].js',
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: '/',
    },
    plugins: [
      //new (webpack as any).NamedModulesPlugin(),
      ...(isDevelopment
        ? [new webpack.HotModuleReplacementPlugin()]
        : [new CleanWebpackPlugin({})]),
      new HtmlWebpackPlugin({
        title: 'LP-Loader ' + (isDevelopment ? 'Dev' : 'Build'),
        filename: 'index.html',
      }),
    ],
    module: {
      rules: [
        {
          test: lpTsIndexFiles,
          use: [
            {
              loader: lpLoader,
              options: {
                name: 'language.pack',
                include: /(\\|\/)\w{2}\.ts/,
              } as LoaderOptions,
            },
          ],
        },
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          //iexclude: [lpTsIndexFiles],
          options: tsLoaderOptions,
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style',
            },
            { loader: 'css' },
          ],
        },
      ],
    },
    devtool: isDevelopment ? 'eval' : 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        //'lp': path.resolve(__dirname, '../../lib/lp-loader.ts'),
      },
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
      ],
    },
  }

  return config
}

export default makeConfig()
