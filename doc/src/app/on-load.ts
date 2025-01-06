import { render } from 'rx-vdom'
import { navigation } from './navigation'
import { Router, DefaultLayout } from 'mkdocs-ts'
import { BehaviorSubject } from 'rxjs'
import { NavHeaderView } from './md-widgets'

export const router = new Router({
    navigation,
})
const bookmarks$ = new BehaviorSubject(['/', '/how-to', '/tutorials', '/api'])
export const topStickyPaddingMax = '3rem'

const routerView = new DefaultLayout.View({
    router,
    bookmarks$,
    layoutOptions: {
        topStickyPaddingMax,
    },
    sideNavHeader: () => new NavHeaderView({ topStickyPaddingMax }),
    sideNavFooter: () =>
        new DefaultLayout.FooterView({
            sourceName: '@rx-vdom/doc',
            sourceUrl: 'https://github.com/w3nest/rx-vdom/tree/main/doc',
        }),
})

document.getElementById('content')?.appendChild(render(routerView))
