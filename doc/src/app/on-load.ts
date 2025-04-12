import { render } from 'rx-vdom'
import { navigation } from './navigation'
import { Router, DefaultLayout } from 'mkdocs-ts'
import { BehaviorSubject } from 'rxjs'
import { NavHeaderView } from './md-widgets'
import { createRootContext, inMemReporter } from './config.context'
import { AuthBadge } from '@w3nest/ui-tk/Badges'
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

const routerView = new DefaultLayout.LayoutWithCompanion(
    {
        router,
        bookmarks$,
        displayOptions: {
            pageVertPadding: '3rem',
        },
        sideNavHeader: () => new NavHeaderView({ topStickyPaddingMax }),
        sideNavFooter: () =>
            new DefaultLayout.FooterView({
                sourceName: '@rx-vdom/doc',
                sourceUrl: 'https://github.com/w3nest/rx-vdom/tree/main/doc',
            }),
        companionNodes$,
        favoritesFooter: new AuthBadge(),
    },
    ctx,
)

document.getElementById('content')?.appendChild(render(routerView))
