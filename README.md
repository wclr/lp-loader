# LP-Loader for Webpack

> Frictionless *Language Packs* for apps loaded and bundled with Webpack. Pure, conscious and flexible way of keeping and loading any kind of dictionary data dynamically on demand.

*Works with Webpack 3 and 4.*

## Why

Webpack is really a great Packager Manager and Bundler, despite all its caveats (mostly related to configuration and performance) it really gives has much more capabilities and puts less limitations on the user than any other bunder I've tried. But some (quite basic) higher level problems seem do be not solved even there.

All the methods of i18n of JS frontend apps (particularly loading/delivering language-specific usually UI-related data) I've seen out there - just ~~suck~~ could not satisfy my really basic requirements (which are mostly - simplicity and flexibility). Sounds strange, but feels like **no one knows how to make it right.** So, this package trying to approach the problem in a bit opinionated but at the same time flexible and generalized way. And this approach turned to be also useful for loading any kind of dictionary-like data sets.

*Note that LP-Loader is still experimental and may probably fail to handle some particular cases (esp. if not aligned with proposed principles). But the concept has been proven and battle tested.*

## What it does

Here is nominal case of bundling language packs. Say you have tree components in your application that you going to bundle with webpack.

```
- app/A
- app/B
- app/C
```
For every component you have specific language dictionary (folder with language files):

```
app/A/dict/
  en.json
  ru.json

app/B/dict/
  en.json
  ru.json

app/C/dict/
  en.json
  ru.json
```

Say you structured the app and configured Webpack to produces two bundles: 
- `bundle-AB` - contains `A` and `B` components 
- `bundle-C` - separate bundle that contains `C` component.

Using `LP-Loader` you will get separate bundles for corresponding dictionaries:

```
bundle-AB.en.lp.js  - will contain `ru` dictionaries for A and B
bundle-AB.ru.lp.js  - will contain `en` dictionaries for A and B

bundle-C.en.lp.js   - will contain `ru` dictionaries for C
bundle-C.ru.lp.js   - will contain `en` dictionaries for C
```

Particular language bundle **will be loaded dynamically on demand** when it will be accessed from it's parent bundle code (see below). If language is not used, language data bundles are not loaded.

As stated above, `LP-Loader` can be used to bundle this way not only language specific dictionaries, but **any *labeled* sets of *data* or *code*** that need to be loaded on demand.

## Installation

![npm (scoped)](https://img.shields.io/npm/v/lp-loader.svg?maxAge=86400)


```
yarn add lp-loader [--dev]
```

## Usage

This is the example with TypeScript based dictionaries (because using TypeScript for language dictionaries data is super cool). So you have to have following files:

```
app/A/
  A.ts        - component file
app/A/dict/
  en.ts      - dictionary file for `English` language
  ru.ts      - dictionary file `Russian` language
  index.ts   - dictionary index file

```

You need to have an index file (`app/A/dict/index.ts`) for each of your dictionary folder. This file may be empty in case of `JS`, but it should exist anyway. It's bundled content will be generated while build by `lp-loader`. 

In case of `TS` to have correct and useful dictionary typings code like this should be put inside:

```ts
type Dict = { 
  /* Here goes a dictionary structure */ 
  title: string
}

declare const getDict: (lang: string) => Promise<Dict>

export default getDict
```

Each language dictionary file will look like this:

```ts
import { Dict } from '.'

const dict: Dict = { 
  title: 'Make i18n Great Again.'
}

export default dict
```

Then you just import this file in your apps code, and use it like this:

```ts
import getDict from './dict'

let lang = 'en'

// this is how you access dictionary data for particular language
getDict(lang).then(dict => console.log(dict.name))
```

[*You may want to look at the example app's code.*](./app)

## Configuration

To get this code working, in `webpack.config` you should define loader for dictionary index files, just like that:

```ts
    {
      test: /dict(\\|\/)index\.ts/, 
      loaders: [
        { loader: 'lp-loader' },
      ]
    }    
```

[*There are example configs in corresponding webpackX folders*](./webpack4/webpack.config.ts). Actually no difference between Webpack 3 and 4.

## Loader options:

You may want to provide additional options for the loader to override the defaults.

```ts
export interface LoaderOptions {
  /**
   * Name of particular label kind, default is `lp`
   * Should use different names for different kinds of content.
   * Label name should not contain dots.
   */
  name?: string,
  /**
   * Custom promise library name to be imported. 
   */
  promiseLib?: string,
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
   * Match labeled files (tests full path), RegExp or function, 
   * By default index.* files are excluded, you may override it with this option.
   */
  include?: RegExp | ((filePath: string) => boolean),
  /**
 * 
 * Do not consider folders as labeled dictionary data. By default `false`
 */
  excludeFolders?: boolean
}
```

## Caveats

There are currently some problems with created bundle's names due to the problem that chunk names are not always available during the Webpack build. But this probably is going to be solved somehow.

## How it works

It is quite simple. Loader finds chunk parents of the dictionary index, and generates special code that allow loading requested data on demand via `Promise` based API.

[*You may want to look at the loader's code.*](./src/lp-loader.ts)

## Licence

WTF.