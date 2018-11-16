import { run } from '@cycle/xstream-run'
import { makeDOMDriver } from '@cycle/dom'
import Main from './Main/Main'

let dispose: any
setTimeout(() => {
  dispose = run(Main, {
    DOM: makeDOMDriver('body')
  })
})

if ((<any>module).hot) {
  (<any>module).hot.accept();
  (<any>module).hot.dispose(() => {    
    dispose()
    document.body.innerHTML = ''
  })
}
