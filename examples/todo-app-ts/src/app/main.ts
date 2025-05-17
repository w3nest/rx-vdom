import './style.css'
export {}
import { install, LoadingScreen } from '@w3nest/webpm-client'
import pkgJson from '../../package.json'

const loadingScreen = new LoadingScreen({
    logo: '../assets/favicon.svg',
    name: pkgJson.name,
    description: pkgJson.description,
})

/**
 *  To take advantage of YouWol ecosystem, the dependencies are not included in the bundle but are kept 'externals'.
 *  This file handle the actual installation of them (if needed, they will most likely already be cached by the browser).
 */
await install({
    esm: [`${pkgJson.name}#${pkgJson.version}`],
    css: [
        'bootstrap#5.3.3~bootstrap.min.css',
        'fontawesome#5.12.1~css/all.min.css',
    ],
    onEvent: (ev) => {
        loadingScreen.next(ev)
    },
})

await import('./on-load')
loadingScreen.done()
