import { render } from 'rx-vdom'
import { navigation } from './navigation'
import { Router, DefaultLayout, RouterView } from 'mkdocs-ts'
import { BehaviorSubject } from 'rxjs'

export const router = new Router({
    navigation,
})
const bookmarks$ = new BehaviorSubject(['/', '/how-to', '/tutorials', '/api'])

const routerView = new RouterView({
    router,
    navNodeView: ({ router, node }) =>
        new DefaultLayout.NavigationNodeHeader({ router, node, bookmarks$ }),
    layoutsFactory: {
        default: ({ router, navNodeView }) =>
            new DefaultLayout.View({
                router,
                navNodeView,
                bookmarks$,
            }),
    },
})

document.getElementById('content')?.appendChild(render(routerView))
