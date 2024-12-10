import { AnyVirtualDOM, attr$ } from 'rx-vdom'
import { setup } from '../auto-generated'
import { from, timer } from 'rxjs'

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
