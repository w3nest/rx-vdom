import './style.css'
export {}
import * as webpmClient from '@w3nest/webpm-client'
import { setup } from '../auto-generated'

/**
 *  To take advantage of YouWol ecosystem, the dependencies are not included in the bundle but are kept 'externals'.
 *  This file handle the actual installation of them (if needed, they will most likely already be cached by the browser).
 */
await setup.installMainModule({
    cdnClient: webpmClient,
    installParameters: {
        css: [
            'bootstrap#5.3.3~bootstrap.min.css',
            'fontawesome#5.12.1~css/all.min.css',
        ],
        displayLoadingScreen: true,
    },
})

await import('./on-load')
