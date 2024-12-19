import {
    AnyVirtualDOM,
    attr$,
    ChildrenLike,
    CSSAttribute,
    VirtualDOM,
} from 'rx-vdom'
import { setup } from '../auto-generated'
import { from, timer } from 'rxjs'
import { MdWidgets } from 'mkdocs-ts'

export function rxVDomSize(): AnyVirtualDOM {
    const url = `/api/assets-gateway/webpm/resources/${window.btoa('rx-vdom')}/${setup.version}/dist/rx-vdom.js`
    return {
        tag: 'i',
        innerText: attr$({
            source$: from(fetch(url, { method: 'GET' })),
            vdomMap: (resp) => {
                const contenLength = resp.headers.get('content-length')
                if (!contenLength) {
                    return '< 5 kB'
                }
                return String(parseInt(contenLength) / 1000) + ' kB'
            },
        }),
    }
}

export function exampleHome(): AnyVirtualDOM {
    const time$ = timer(0, 1000)

    return {
        tag: 'div',
        class: 'border rounded p-1',
        children: [
            {
                tag: 'i',
                class: {
                    source$: time$,
                    vdomMap: (tick: number) => (tick % 2 ? 'text-success' : ''),
                    wrapper: (d) => `${d} fas fa-clock`,
                },
            },
            {
                source$: time$,
                vdomMap: () => ({
                    tag: 'i',
                    class: 'mx-1',
                    innerText: new Date().toLocaleTimeString(),
                }),
            },
        ],
    }
}

export function apiLink(elem: HTMLElement): AnyVirtualDOM {
    const target = elem.getAttribute('target')
    const kind = elem.getAttribute('kind')
    if (!target) {
        throw Error('Target is not specified')
    }
    return {
        tag: 'a',
        href: `@nav/api.${target}`,
        class: `mkapi-semantic-flag mkapi-role-${kind ?? ''}`,
        children: [
            {
                tag: 'i',
                innerText: target,
            },
            {
                tag: 'i',
                class: 'fas fa-code',
                style: {
                    transform: 'scale(0.65) translate(0,-7px)',
                },
            },
        ],
    }
}

export class NavHeaderView implements VirtualDOM<'div'> {
    public readonly tag = 'div'
    public readonly class = 'd-flex align-items-center justify-content-center'
    public readonly children: ChildrenLike
    public readonly style: CSSAttribute

    constructor(params: { topStickyPaddingMax: string }) {
        this.style = {
            height: params.topStickyPaddingMax,
        }
        this.children = [
            {
                tag: 'a',
                class: 'mx-2',
                href: 'https://github.com/w3nest/rx-vdom',
                children: [
                    {
                        ...MdWidgets.githubIcon,
                        style: {
                            filter: 'invert(1)',
                        },
                    },
                ],
            },
            {
                tag: 'a',
                class: 'mx-2',
                href: 'https://www.npmjs.com/package/rx-vdom',
                children: [MdWidgets.npmIcon],
            },
            {
                tag: 'a',
                class: 'mx-2',
                href: 'https://github.com/w3nest/rx-vdom/blob/main/doc/LICENSE',
                children: [MdWidgets.mitIcon],
            },
        ]
    }
}
