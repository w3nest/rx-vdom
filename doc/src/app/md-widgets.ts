import { AnyVirtualDOM, attr$ } from 'rx-vdom'
import pkgJson from '../../package.json'
import { from } from 'rxjs'
import { MdWidgets } from 'mkdocs-ts'

import LinksDict from './links.json'

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

MdWidgets.ApiLink.Mapper = (target: string, elem: HTMLElement) => {
    const kind = elem.getAttribute('kind')
    return {
        href: `@nav/api.${target}`,
        withClass: `mkapi-role-${kind ?? ''}`,
    }
}
MdWidgets.ExtLink.Mapper = (target: string) => {
    return {
        href: LinksDict.extLinks[target] as string,
    }
}
MdWidgets.GitHubLink.Mapper = (target: string) => {
    return {
        href: LinksDict.githubLinks[target] as string,
    }
}

MdWidgets.CrossLink.Mapper = (target: string) => {
    return {
        href: LinksDict.crossLinks[target] as string,
    }
}
