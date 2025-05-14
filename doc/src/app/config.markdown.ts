import pkgJson from '../../package.json'
import {
    DefaultLayout,
    fromMarkdown,
    GlobalMarkdownViews,
    installNotebookModule,
} from 'mkdocs-ts'
import { rxVDomSize } from './md-widgets'
import { example1 } from './js-plaground-examples'
import { companionNodes$, router } from './on-load'
import { child$ } from 'rx-vdom'
import { from } from 'rxjs'

export const url = (restOfPath: string) => `../assets/${restOfPath}`

GlobalMarkdownViews.factory = {
    ...GlobalMarkdownViews.factory,
    'rx-vdom-size': () => rxVDomSize(),
    'split-api': () => ({
        tag: 'i',
        class: 'mkdocs-inv',
        children: [
            DefaultLayout.splitCompanionAction({
                path: '/api',
                companionNodes$,
            }),
        ],
    }),
    'example-timer': () => {
        return {
            tag: 'div' as const,
            children: [
                child$({
                    source$: from(installNotebookModule()),
                    vdomMap: (mdle) => {
                        return new mdle.NotebookSection({
                            src: `
<js-cell>
const { rxjs, rxvdom } = await webpm.install({
    esm:[
        "rxjs#^7.8.2 as rxjs",
        "rx-vdom#^{{rxvdom-version}} as rxvdom"
    ]
})
const { timer, map } = rxjs
const { render } = rxvdom

const Clock = () => {
    const t$ = timer(0, 1000)
    const icon = {
        tag: 'i', 
        class: t$.pipe(map( (t) => \`\${t % 2 ? 'text-success' : ''} fas fa-clock\`))
    }
    return {
        tag: 'div', class: 'border rounded p-1',
        children: [
            icon,
            {
                source$: t$,
                vdomMap: () => ({
                    tag: 'i', class: 'mx-1', 
                    innerText: new Date().toLocaleTimeString(),
                }),
            },
        ]
    }
}
display(render(Clock()))
</js-cell>
    `,
                            router,
                            options: {
                                runAtStart: true,
                                markdown: {
                                    placeholders,
                                },
                            },
                        })
                    },
                }),
            ],
        }
    },
}

export function fromMd(file: string) {
    return fromMarkdown({
        url: url(file),
        placeholders,
    })
}

export const placeholders = {
    '{{project}}': 'rx-vdom',
    '{{rxvdom-version}}': pkgJson.version,
    '{{URL-example-cdn}}': `/apps/@w3nest/play-js/latest?content=${encodeURIComponent(example1)}`,
    '{{rx-vdom}}': '**`rx-vdom`**',
}
