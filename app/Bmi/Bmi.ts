import { h, div } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/xstream-typings'
import xs, { Stream } from 'xstream'
import getDict, { keys } from './dict'
import { Slider } from './Slider'
const { fromPromise, combine, merge } = xs

console.log('keys', keys())

export const Bmi = ({
  DOM,
  language$,
}: {
  DOM: DOMSource
  language$: Stream<string>
}) => {
  Slider({ DOM })

  let dict$ = language$.map(getDict).map(fromPromise).flatten()

  return {
    DOM: combine(dict$).map(([dict]) => {
      return div([div('BMI:' + dict.desc)])
    }),
  }
}

export default Bmi
