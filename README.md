# LP-Loader for Webpack

> Frictionless language packs for apps loaded and bundled with Webpack. Though `L` may stand for anything, may call it `Label` for general case.

## What it does

#### Simple example of bundling language packs.

Say you have tree components in your application that you going to bundle with webpack.

```
- app/A
- app/B
- app/C
```
For every component you have a language dictionaries:

```
app/A/dict/en.json
app/A/dict/ru.json

app/B/dict/en.json
app/B/dict/ru.json

app/C/dict/en.json
app/C/dict/ru.json
```

Say you tuned webpack to produce two bundles: `bundle-AB` that contains `A` and `B` components and separate `bundle-C` that contains `C` component.

Using `Lp-loader` you also get dynamicly loaded bundles tat contain corresponding dictionaries:

```
bundle-AB.ru.lp.js  - will contain `ru` dictionaries for A and B
bundle-AB.en.lp.js  - will contain `en` dictionaries for A and B

bundle-C.ru.lp.js   - will contain `ru` dictionaries for C
bundle-C.ru.lp.js   - will contain `en` dictionaries for C
```

Particular language bundle **will be loaded dynamicly on demand** when it will be accessed from it's parent bundle code.

Note, `LP-loader` can be used to bundle this way not only language packs, but **any *labeled* sets of *data* or *code*** that should be loaded dynamicly on demand.

## Configuration

First, determine which files will be used as lp index files. This files you will be importing to get access to the labeld files.

```
app/A/dict/en.ts      - dict for `english` language
app/A/dict/ru.ts      - dict for `english` language
app/A/dict/index.ts   - lp-index file
app/A/index.ts        - component file
```

Your lp-index file (`app/A/dict/index.ts`) should return

```
```

- in component file you import lp-index file

```ts
import getDict from './dict'

let lang = 'en'

// this is how you access dictionary data for particular language
getDict(lang).then(dict => ...)
```

In webpack config you should define loader for this files:

```ts
    {
      test: /dict(\\|\/)index.ts/, loaders: [
        { loader: 'lp-loader', options: { name: 'language.pack' } },
        // determine transform loaders for lp-indx files:
        { loader: 'ts-loader', options: tsLoaderOptions }
      ]
    },
    {
      test: /\.ts$/,
      loader: 'ts-loader',
      // dont forget to exlude lp-index files from general loader rules:
      exclude: [/dict(\\|\/)index.ts/], 
      options: tsLoaderOptions
    },
```

## Loader options:

```ts
export interface LoaderOptions {
  /**
   * Name of particular label kind, default is `lp`
   * Should use different names for different kinds of content.
   * Label name should not contain dots.
   */
  name?: string,
  /**
   * Custom promis library to be imported. 
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
}
```

## How it works

While loading of lp-index file `lp-loader it determines to which bundle it belongs and transforms lp-index file so that it exports correct code.


