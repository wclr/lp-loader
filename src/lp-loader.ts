/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author: Whitecolor
 */
import * as path from 'path'
import * as fs from 'fs'
import * as qs from 'querystring'
import { getShortHash } from './hash'

export interface LoaderOptions {
  /**
   * Name of particular label kind, default is `lp`
   * Should use different names for different kinds of content.
   * Label name should not contain dots.
   */
  name?: string
  /**
   * Custom promis library to be imported.
   */
  promiseLib?: string

  disableLoaders?: boolean // TODO: remove this option?
  /**
   * Target ES format for exporting loading function.
   * Default is es6.
   */
  exportTarget?: 'es5' | 'es6'
  /**
   * Default is `exports.default = ...`
   * If you seet empty string then export will be `exports = ` for ES5 format
   */
  exportName?: string
  /**
   *
   * Match label files names (actually full path), RegExp or function,
   * By default index.* files are excluded, you may override it.
   */
  include?: RegExp | ((filePath: string) => boolean)
  /**
   *
   * Do not consider folders as labeled dictionary data. By default `false`
   */
  excludeFolders?: boolean
  /**
   *
   * Output some debug data
   */
  debug?: boolean
}

// https://webpack.js.org/api/stats/#module-objects
type Module = {
  id: number | null
  name: string
  debugId: number
  context: string
  userRequest: string
  reasons: Reason[] // only in webpack4
}

interface Dependency {
  module: Module
  block:
    | {
        chunkName?: string
      }
    | undefined
}

type Reason = {
  module: Module
  dependency: Dependency
}

interface LoaderSharedData {
  result: string
  exportStr: string
  fullExportStr: string
  promiseStr: string
}

interface LoaderContext {
  _module: Module
  data: LoaderSharedData
  cacheable: () => {}
  query: LoaderOptions | string
  resourcePath: string
  rootContext: string
}

const flatten = <T>(flat: T[], found: T[]): T[] => flat.concat(found)

const uniq = <T>(val: T, index: number, arr: T[]): boolean =>
  arr.indexOf(val) == index

const isDependencyStatic = (dependency: Dependency): boolean => {
  return !dependency.block
}

const isDependencyDynamic = (dependency: Dependency): boolean =>
  !!dependency.block

const getChunkNameOfDynamicDependency = (mod: Module) =>
  (
    mod.reasons.map(r => r.dependency).filter(isDependencyDynamic)[0] || {
      block: { chunkName: '' },
    }
  ).block!.chunkName

const isModuleDynamicDependency = (mod: Module): boolean => {
  // Maybe here we should check non-zero count of dynamic relations
  // instead of checking zero count of static relations?
  return (
    mod.reasons.map(r => r.dependency).filter(isDependencyStatic).length === 0
  )
}

const moduleIsChunk = isModuleDynamicDependency

const onlyStaticParents = (r: Reason) => isDependencyStatic(r.dependency)

const findChunkParents = (mod: Module, depsChain: Module[] = []): Module[] => {
  const staticParents = mod.reasons
    .filter(onlyStaticParents)
    .map(r => r.module)
    .filter(uniq)
    .filter(_ => !!_)
  const staticParentsNotInChain = staticParents.filter(
    m => depsChain.indexOf(m) < 0
  )
  if (!staticParents.length) {
    return [mod]
  }
  const chunks = staticParentsNotInChain.filter(moduleIsChunk)
  const notChunks = staticParentsNotInChain.filter(m => !moduleIsChunk(m))
  const newChain = depsChain.concat(mod).concat(notChunks)
  return notChunks
    .map(m => findChunkParents(m, newChain))
    .reduce<Module[]>(flatten, [])
    .concat(chunks)
}

function getOptions(context: LoaderContext): LoaderOptions {
  const query = context.query
  if (typeof query === 'string' && query !== '') {
    return qs.parse(context.query as string)
  }
  if (!query || typeof query !== 'object') {
    return {}
  }
  return query
}

module.exports = function (this: LoaderContext, source: string) {
  const options = getOptions(this)
  const parentChunks = findChunkParents(this._module)
  if (process.env.LP_DEBUG || options.debug) {
    console.log('LP-LOADER:', this._module.context)
    console.log(
      'Static parents: ',
      this._module.context,
      parentChunks.filter(uniq).map(p => ({
        req: p.userRequest,
        name: p.name,
        id: p.id,
        debugId: p.debugId,
      }))
    )
  }
  const parentChunksIds = parentChunks
    .map(
      m => m.name || getChunkNameOfDynamicDependency(m) || ''
      //m.debugId
    )
    .filter(_ => _)
    .filter(uniq)
    .sort()

  const parentChunksContextId = getShortHash(
    parentChunks
      .map(m => m.context.slice(this.rootContext.length))
      .filter(uniq)
      .join('')
      .replace(/\\/g, '/')
  )

  const chunkId = parentChunksIds.concat(parentChunksContextId).join('-')
  const newExport = this.data.fullExportStr.replace(
    /__CHUNK_ID__/g,
    chunkId + '.'
  )
  const replaceRegExp = new RegExp(this.data.exportStr + '.*?;')
  if (replaceRegExp.test(source)) {
    source = source.replace(replaceRegExp, newExport)
  } else {
    source = [this.data.promiseStr, newExport].join('\n')
  }
  return source
}

module.exports.pitch = function (
  this: LoaderContext,
  remainingRequest: string,
  precedingRequest: string,
  data: LoaderContext['data']
) {
  this.cacheable && this.cacheable()

  const options = getOptions(this)
  const promiseLib = options.promiseLib || ''
  const bundleName = options.name || 'lp'
  const requestParts = remainingRequest.split('!')
  const request = requestParts.pop()
  const excludeFiles = /^index\./
  const disableLoaders = options.disableLoaders!
  const exportName =
    typeof options.exportName === 'string' ? options.exportName : 'default'

  remainingRequest = requestParts.length ? requestParts.join('!') + '!' : ''

  const stats = fs.lstatSync(request!)
  const dirname = stats.isDirectory() ? request! : path.dirname(request!)

  type Entry = { fileName: string; label: string }
  const filterFiles = (fileName: string) => {
    const filePath = path.join(dirname, fileName)
    const includeMatch = options.include as any
    return (
      (includeMatch
        ? typeof includeMatch === 'function'
          ? includeMatch(filePath)
          : includeMatch.test(filePath)
        : !excludeFiles.test(fileName)) &&
      (options.excludeFolders ? !fs.statSync(filePath).isDirectory() : true)
    )
  }
  const entries: Entry[] = fs
    .readdirSync(dirname)
    .filter(filterFiles)
    .map(fileName => ({
      fileName,
      label: fileName.replace(/\..*/, ''),
    }))

  const getPromiseSource = (entry: Entry) => {
    const labeledModulePath = JSON.stringify(
      disableLoaders
        ? '!!'
        : '' + remainingRequest + path.resolve(dirname, entry.fileName)
    )
    return [
      ` return new Promise(function (resolve) {`,
      `    require.ensure([], function (require) {`,
      `       var imported = require(${labeledModulePath});`,
      `       resolve(imported.__esModule ? imported.default : imported);\n`,
      `    } , "__CHUNK_ID__${bundleName}.${entry.label}");`,
      `  });`,
    ].join('\n')
  }
  const exportTarget =
    typeof options.exportTarget === 'string'
      ? options.exportTarget.toLocaleLowerCase()
      : 'es6'

  const exportStr =
    exportTarget === 'es6'
      ? exportName === 'default'
        ? 'export default'
        : `export const {exportName} =`
      : `exports${exportName ? '.' + exportName : ''} =`

  const promiseStr = promiseLib
    ? `var Promise = require(${JSON.stringify(promiseLib)});\n`
    : ''

  const fullExportStr = [`${exportStr} function (label) {\n`]
    .concat(
      entries.map(entry =>
        [
          'if (label === ' + JSON.stringify(entry.label) + ') {',
          getPromiseSource(entry),
          '}\n',
        ].join('')
      ),
      'return Promise.resolve();',
      '};'
    )
    .join('')

  data.promiseStr = promiseStr
  data.exportStr = exportStr
  data.fullExportStr = fullExportStr
  data.result = [promiseStr, fullExportStr].join('')
}
