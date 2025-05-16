import { render } from 'rx-vdom'
import { navigation } from './navigation'
import { Router, DefaultLayout } from 'mkdocs-ts'
import { BehaviorSubject } from 'rxjs'
import { createRootContext, inMemReporter } from './config.context'
import { AuthBadge } from '@w3nest/ui-tk/Badges'
import { Footer } from '@w3nest/ui-tk/Mkdocs'
const ctx = createRootContext({
    threadName: 'App',
    labels: [],
})

console.log('In memory logs reporter', inMemReporter)

export const router = new Router(
    {
        navigation,
    },
    ctx,
)

export const companionNodes$ = new BehaviorSubject<string[]>([])

const bookmarks$ = new BehaviorSubject(['/', '/how-to', '/tutorials', '/api'])
export const topStickyPaddingMax = '3rem'

const footer = new Footer({
    license: 'MIT',
    copyrights: [
        { year: '2021-2024', holder: 'YouWol' },
        { year: '2025', holder: 'Guillaume Reinisch' },
    ],
    github: 'https://github.com/w3nest/rx-vdom',
    npm: 'https://www.npmjs.com/package/rx-vdom',
    docGithub: 'https://github.com/w3nest/rx-vdom/tree/main/doc',
})

const routerView = new DefaultLayout.LayoutWithCompanion(
    {
        router,
        bookmarks$,
        topBanner: {
            logo: {
                icon: '../assets/reactivex.svg',
                title: 'Rx-vDOM',
            },
            expandedContent: new DefaultLayout.BookmarksView({
                bookmarks$,
                router,
            }),
            badge: new AuthBadge(),
        },
        footer,
        navFooter: true,
        displayOptions: {
            pageVertPadding: '3rem',
        },
        companionNodes$,
    },
    ctx,
)

document.getElementById('content')?.appendChild(render(routerView))
