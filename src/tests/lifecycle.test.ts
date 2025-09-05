import { append$, child$, render, replace$, sync$, VirtualDOM } from '../lib'
import { BehaviorSubject, map, Subject } from 'rxjs'

beforeAll(() => {
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
        cb(0)
        return 0
    }
})

function observersCount(obs$: Subject<unknown>) {
    // noinspection JSDeprecatedSymbols -- will need to find a better way when moving to RxJS#8
    return obs$.observers.length
}
test('connected/disconnected callback & subscriptions', () => {
    //spy.flush()
    const obs$ = new BehaviorSubject<string>('foo')
    const events: string[] = []
    const dataCustom: number[] = []
    const custom$ = new BehaviorSubject(1)
    const sub = custom$.subscribe((d) => {
        dataCustom.push(d)
    })

    const vDom: VirtualDOM<'div'> = {
        tag: 'div',
        innerText: obs$,
        connectedCallback: (elem) => {
            events.push('connected')
            elem.ownSubscriptions(sub)
            elem.hookOnDisconnected(() => events.push('disconnected hook'))
        },
        disconnectedCallback: () => {
            events.push('disconnected')
        },
    }
    const html = render(vDom)

    document.body.appendChild(html)
    expect(html['innerText']).toBe('foo')
    expect(events[0]).toBe('connected')

    expect(observersCount(obs$)).toBe(1)
    expect(observersCount(custom$)).toBe(1)
    custom$.next(2)
    expect(dataCustom).toHaveLength(2)

    document.body.innerHTML = ''
    expect(events[1]).toBe('disconnected hook')
    expect(events[2]).toBe('disconnected')
    expect(observersCount(obs$)).toBe(0)
    expect(observersCount(custom$)).toBe(0)

    custom$.next(3)
    expect(dataCustom).toHaveLength(2)
})

test('render hooks', () => {
    const rendered: HTMLElement[] = []
    const rendered2: HTMLElement[] = []
    const custom$ = new BehaviorSubject(1)

    const vDom: VirtualDOM<'div'> = {
        tag: 'div',
        onRender: [
            (s) => {
                rendered.push(s)
            },
        ],
        children: [
            {
                tag: 'h1',
                innerText: 'title',
                children: append$({
                    policy: 'append',
                    source$: custom$.pipe(map((d) => [d])),
                    vdomMap: () => {
                        return {
                            tag: 'h3',
                            title: 'title3',
                            onRender: [
                                (s) => {
                                    rendered2.push(s)
                                },
                            ],
                            children: replace$({
                                policy: 'replace',
                                source$: custom$,
                                vdomMap: () => {
                                    return [
                                        {
                                            tag: 'h4',
                                            title: 'title4',
                                        },
                                    ]
                                },
                            }),
                        }
                    },
                }),
            },
            child$({
                source$: custom$,
                vdomMap: () => {
                    return {
                        tag: 'h2',
                        title: 'title2',
                        children: sync$({
                            policy: 'sync',
                            source$: custom$.pipe(map((d) => [d])),
                            vdomMap: () => {
                                return {
                                    tag: 'h5',
                                    title: 'title5',
                                }
                            },
                        }),
                    }
                },
            }),
        ],
    }
    const html = render(vDom)
    document.body.appendChild(html)
    expect(rendered).toHaveLength(6)
    expect(rendered2).toHaveLength(2)
})
