import { h, div } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/xstream-typings'
import xs, { Stream } from 'xstream'
import dict from './dict'

const { fromPromise, combine, merge } = xs

export const Main = ({ DOM }: { DOM: DOMSource }) => {

  let language$ = xs.of('en')
  let dict$ = language$.map(dict)
    .map(fromPromise).flatten()

  return {
    DOM: combine(language$, dict$).map(([language, dict]) => {
      return div([
        div('language:' + language),
        div('desc:' + dict.desc),
      ])
    })
  }
}

export default Main