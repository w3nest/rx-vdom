import { render } from 'rx-vdom'
import { navigation } from './navigation'
import { Router, Views } from 'mkdocs-ts'
import { BehaviorSubject } from 'rxjs'

export const router = new Router({
    navigation,
})

document.getElementById('content')?.appendChild(
    render(
        new Views.DefaultLayoutView({
            router,
            bookmarks$: new BehaviorSubject([
                '/',
                '/how-to',
                '/tutorials',
                '/api',
            ]),
        }),
    ),
)
