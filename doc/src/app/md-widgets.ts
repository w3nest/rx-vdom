import {
    AnyVirtualDOM,
    attr$,
    ChildrenLike,
    CSSAttribute,
    VirtualDOM,
} from 'rx-vdom'
import pkgJson from '../../package.json'
import { from, map, timer } from 'rxjs'
import { MdWidgets } from 'mkdocs-ts'

export function rxVDomSize(): AnyVirtualDOM {
    const url = `/api/assets-gateway/webpm/resources/${window.btoa('rx-vdom')}/${pkgJson.version}/dist/rx-vdom.js`
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
                class: time$.pipe(
                    map((t) => `${t % 2 ? 'text-success' : ''} fas fa-clock`),
                ),
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

export class ExtLink implements VirtualDOM<'a'> {
    public readonly tag = 'a'
    public readonly children: ChildrenLike
    public readonly innerText: string
    public readonly href: string
    public readonly target = '_blank'

    constructor(elem: HTMLElement) {
        const target = elem.getAttribute('target')
        if (!target) {
            console.warn('Can no find target for extlink', elem)
            return
        }
        const navs = {
            rxjs: 'https://rxjs.dev/',
            rxjsOperators: 'https://rxjs.dev/guide/operators',
            react: 'https://react.dev',
            vue: 'https://vuejs.org',
            learnRxJS: 'https://www.learnrxjs.io/',
            mkdocsTS: '/apps/@mkdocs-ts/doc/latest',
            reactivex: 'https://reactivex.io/',
            chartjs: 'https://www.chartjs.org/',
            shareReplay: 'https://rxjs.dev/api/operators/shareReplay',
        }
        if (!(target in navs)) {
            return
        }
        this.href = navs[target as keyof typeof navs]
        this.children = [
            {
                tag: 'i',
                innerText: elem.textContent ?? '',
            },
            {
                tag: 'i',
                class: 'fas fa-external-link-alt',
                style: { transform: 'scale(0.6)' },
            },
        ]
    }
}

export class GitHubLink implements VirtualDOM<'a'> {
    public readonly tag = 'a'
    public readonly children: ChildrenLike
    public readonly innerText: string
    public readonly href: string
    public readonly target = '_blank'

    constructor(elem: HTMLElement) {
        const target = elem.getAttribute('target')

        if (!target) {
            return
        }
        const navs = {
            'rx-vdom': 'https://github.com/w3nest/rx-vdom',
            examples: 'https://github.com/w3nest/rx-vdom/tree/main/examples',
        }
        if (!(target in navs)) {
            return
        }
        this.href = navs[target as keyof typeof navs]
        this.children = [
            {
                tag: 'i',
                innerText: elem.textContent ?? '',
            },
            {
                tag: 'i',
                class: 'fab fa-github',
                style: { transform: 'scale(0.8)' },
            },
        ]
    }
}

export class CrossLink implements VirtualDOM<'a'> {
    public readonly tag = 'a'
    public readonly children: ChildrenLike
    public readonly innerText: string
    public readonly href: string

    constructor(elem: HTMLElement) {
        const target = elem.getAttribute('target')
        if (!target) {
            return
        }
        const navs = {
            gettingStarted: '@nav/tutorials/basics',
            todoApp: '@nav/tutorials/todo',
            howTo: '@nav/how-to',
            api: '@nav/api',
        }
        if (!(target in navs)) {
            return
        }
        this.href = navs[target as keyof typeof navs]
        this.children = [
            {
                tag: 'i',
                innerText: elem.textContent ?? '',
            },
            {
                tag: 'i',
                class: 'fas fa-book-open',
                style: { transform: 'scale(0.6)' },
            },
        ]
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
                target: '_blank',
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
                target: '_blank',
                href: 'https://www.npmjs.com/package/rx-vdom',
                children: [MdWidgets.npmIcon],
            },
            {
                tag: 'a',
                class: 'mx-2',
                target: '_blank',
                href: 'https://github.com/w3nest/rx-vdom/blob/main/doc/LICENSE',
                children: [MdWidgets.mitIcon],
            },
        ]
    }
}
