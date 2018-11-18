import { h, div, select, option } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/xstream-typings'
import xs, { Stream } from 'xstream'
import dict from './dict'
import delay from 'xstream/extra/delay'

const { fromPromise, combine, merge } = xs

const BmiDeferred = ({ DOM, language$ }:
  { DOM: DOMSource, language$: Stream<string> }) => {
  return fromPromise(import(/* webpackChunkName: "bmi" */ '../Bmi'))
    .map(_ => _.Bmi).compose(delay(6000))
    .map((Bmi) => Bmi({ DOM, language$ }).DOM)
    .flatten()
}

export const Main = ({ DOM }: { DOM: DOMSource }) => {

  let language$ = DOM.select('select').events('change')
    .map(ev => (<HTMLSelectElement>ev.target).value)
    .startWith('ru')
  let dict$ = language$.map(dict)
    .map(fromPromise).flatten()

  let bmiDOM$ = BmiDeferred({ DOM, language$ })
    .startWith(div([]))

  return {    
    DOM: combine(language$, dict$, bmiDOM$).map(([language, dict, bmiDOM]) => {
      return div([
        select([
          option({ props: { value: 'en', selected: language === 'en' } }, 'English'),
          option({ props: { value: 'ru', selected: language === 'ru' } }, 'Russian')
        ]),
        div('Title:' + dict.title),
        div([bmiDOM || dict.loadingBMI])
      ])
    })
  }
}

export default Main