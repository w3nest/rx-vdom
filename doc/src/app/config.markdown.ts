import pkgJson from '../../package.json'
import { DefaultLayout, fromMarkdown, GlobalMarkdownViews } from 'mkdocs-ts'
import {
    ExtLink,
    rxVDomSize,
    exampleHome,
    apiLink,
    CrossLink,
    GitHubLink,
} from './md-widgets'
import { example1 } from './js-plaground-examples'
import { companionNodes$ } from './on-load'

export const url = (restOfPath: string) => `../assets/${restOfPath}`

GlobalMarkdownViews.factory = {
    ...GlobalMarkdownViews.factory,
    'rx-vdom-size': () => rxVDomSize(),
    'example-home': () => exampleHome(),
    'api-link': (elem: HTMLElement) => {
        return apiLink(elem)
    },
    'ext-link': (elem: HTMLElement) => new ExtLink(elem),
    'cross-link': (elem: HTMLElement) => new CrossLink(elem),
    'github-link': (elem: HTMLElement) => new GitHubLink(elem),
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
