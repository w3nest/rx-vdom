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

// the state
const t$ = timer(0, 1000)
const even$ = t$.pipe(map( t => t % 2))

// the view
const class$ = even$.pipe(
    map( (even) => \`\${even ? 'text-success' : ''} fas fa-clock mx-1\`)
)
const view = {
    tag: 'div', class: 'border rounded p-1',
    children: [
        {
            tag: 'i', 
            class: class$
        },
        {
            source$: t$,
            vdomMap: () => ({
                tag: 'i', 
                innerText: new Date().toLocaleTimeString(),
            }),
        },
    ]
}
// 'render' create a regular HTMLElement, until there 'rx-vdom' has not been used
display(render(view))
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
    'example-trex': () => {
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
const { timer, startWith, takeWhile, map, concat, repeat} = rxjs

const State = () => {
    const running$ = timer(0, 100).pipe(
        startWith(0),
        takeWhile((t) => t < 40),
        map((t) => {
            const range = Math.ceil((t + 1) / 10);
            const side = range % 2 === 0 ? 'l' : 'r';
            const runningLegState = t % 2 === 1 ? 3 : 4;
            const index = t === 39 ? 1 : runningLegState;
            return {side, index}
        })
    );

    const blinkingEyes$ = timer(0, 500).pipe(
        startWith(0),
        takeWhile((t) => t < 5),
        map((t) => ({side:'l', index: t % 2 === 1 ? 1 : 2}))
    );

    const resting$ = timer(1000).pipe(
        startWith(0),
        map(() => ({side:'l', index: 2}))
    );
    return concat(
        running$,
        blinkingEyes$,
        resting$
    ).pipe(repeat(Infinity));
}
const state$ = State() 

const base = {
    width: '80px',
    height: '86px',
    background: 'url(../assets/trex.png)',
    backgroundPositionY: '-100px',            
}
const style$  = state$.pipe(
   map(({side, index}) => {
       return {
           ...base,
           transform: side === 'l' ? 'scaleX(-1)' : 'scaleX(1)',
           backgroundPositionX: \`-\${index-1}00px\`
       }                   
   })
)
   
const view = {
    tag: 'div',
    style: style$
}

display(rxvdom.render(view))

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
