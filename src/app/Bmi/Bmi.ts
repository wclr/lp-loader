import {h, div} from '@cycle/dom'
import { DOMSource } from '@cycle/dom/xstream-typings'
import xs, { Stream } from 'xstream'
import dict from './dict' 

const {fromPromise, combine, merge} = xs

export const Bmi = ({DOM, language$}: { DOM: DOMSource, language$: Stream<string> }) => {
  
  let dict$ = language$.map(dict)    
    .map(fromPromise).flatten()    

  return {
    DOM: combine(dict$).map(([dict]) => {
      return div([
        div('BMI:' + dict.desc),
      ])
    }) 
  }
}

export default Bmi