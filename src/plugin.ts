import * as path from 'path'

export interface LpPluginOptions {
  name?: string
  promise?: string
  testImport?: RegExp
}

/**
 * Custom resolver plugin
 */
export class LpPlugin {
  private customResolverPlugin: any
  private name: string
  private testImport?: RegExp
  public readonly __lpPlugin = true 
  constructor(options: LpPluginOptions = {}) {
    this.name = options.name || 'lp'
    const testImport = this.testImport = options.testImport
    
    this.customResolverPlugin = {
      apply: function (resolver: any) {
        resolver.plugin('resolve', (context: any, callback: any) => {
          if (testImport && testImport.test(context.request)) {
            return callback(null, {
              path: path.resolve(context.path, context.request)
            })
          }
          return callback()
        })
      }
    }
  }

  apply(compiler: any) {    
    // compiler.resolvers.normal.apply(this.customResolverPlugin);
  }
  // apply(resolver: any) {    
  //   resolver.plugin('resolve', (context: any, callback: any) => {
  //     if (this.testImport && this.testImport.test(context.request)) {
  //       return callback(null, {
  //         path: path.resolve(context.path, context.request)
  //       })
  //     }
  //     return callback()
  //   })
  // }
}