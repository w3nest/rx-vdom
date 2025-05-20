import { State } from './state'
import { AppView } from './views'
import { render } from 'rx-vdom'

const vDOM = new AppView({
    state: new State(),
})
document.body.appendChild(render(vDOM))
export {}
