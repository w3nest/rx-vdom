import { VirtualDOM, replace$, AnyVirtualDOM, sync$ } from '../../lib'
import { of } from 'rxjs'
import { AssertTrue as Assert, IsExact } from 'conditional-type-checks'

const source$ = of('https://foo.com')

{
    // RxChild, no type hints
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        // @ts-expect-error -- 5 is not a VDom
        children: {
            policy: 'replace',
            source$,
            vdomMap: (_) => {
                return 5
            },
        },
    }
}

{
    // RxChild, no type hints
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: {
            policy: 'replace',
            source$,
            vdomMap: (_) => {
                return [{ tag: 'div' }, { tag: 'a' }]
            },
        },
    }
}

{
    // children$ replace
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: replace$({
            // @ts-expect-error -- should be 'replace'
            policy: 'foo',
        }),
    }
}

{
    // children$ replace with errors
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: replace$({
            policy: 'replace',
            source$,
            // @ts-expect-error -- { tag: 'foo' } is not a VDom
            vdomMap: (_src) => {
                type _ = Assert<IsExact<typeof _src, string>>
                return [{ tag: 'foo' }]
            },
            // @ts-expect-error -- 5 is not a VDom
            wrapper: (domValue) => {
                type _ = Assert<IsExact<typeof domValue, AnyVirtualDOM[]>>
                return [5, ...domValue]
            },
            comparisonOperator: (d1, d2) => {
                // whatever: not part of the 'replace' policy.
                type _0 = Assert<IsExact<typeof d1, any>>
                type _1 = Assert<IsExact<typeof d2, any>>
            },
        }),
    }
}

{
    // children$ replace with errors
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: replace$({
            policy: 'replace',
            source$,
            vdomMap: (_src) => {
                type _ = Assert<IsExact<typeof _src, string>>
                return [{ tag: 'i' }]
            },
            wrapper: (domValue) => {
                type _ = Assert<IsExact<typeof domValue, AnyVirtualDOM[]>>
                return [{ tag: 'div' }, ...domValue]
            },
            // @ts-expect-error -- does not exists
            comparisonOperator: (d1, d2) => {},
        }),
    }
}

{
    // children$ sync with errors
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: sync$({
            policy: 'sync',
            // @ts-expect-error -- need observable on array
            source$,
            // @ts-expect-error -- need a VirtualDOM
            vdomMap: (_src) => {
                return { tag: 'foo' }
            },
        }),
    }
}

{
    // children$ sync with errors
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: sync$({
            policy: 'sync',
            source$: of(['https://foo.com']),
            vdomMap: (_src) => {
                return { tag: 'i' }
            },
            wrapper: (domValue) => {
                return [5, ...domValue]
            },
            // @ts-expect-error -- missing return
            comparisonOperator: (d1, d2) => {
                type _0 = Assert<IsExact<typeof d1, string>>
                type _1 = Assert<IsExact<typeof d2, string>>
            },
        }),
    }
}

{
    // children$ sync with errors
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: sync$({
            policy: 'sync',
            source$: of(['https://foo.com']),
            vdomMap: (_src) => {
                return { tag: 'i' }
            },
            // @ts-expect-error -- wrapper not part of API
            wrapper: (domValue) => {
                return [5, ...domValue]
            },
            comparisonOperator: (d1, d2) => {
                type _0 = Assert<IsExact<typeof d1, string>>
                type _1 = Assert<IsExact<typeof d2, string>>
                return true
            },
        }),
    }
}

{
    // children$ sync with errors
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: sync$({
            policy: 'sync',
            source$: of(['https://foo.com']),
            vdomMap: (_src) => {
                return { tag: 'i' }
            },
            // @ts-expect-error -- no return
            comparisonOperator: (d1, d2) => {
                type _0 = Assert<IsExact<typeof d1, string>>
                type _1 = Assert<IsExact<typeof d2, string>>
            },
        }),
    }
}

{
    // children$ sync OK
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: sync$({
            policy: 'sync',
            source$: of(['https://foo.com']),
            vdomMap: (_src) => {
                return { tag: 'i' }
            },
            comparisonOperator: (d1, d2) => {
                type _0 = Assert<IsExact<typeof d1, string>>
                type _1 = Assert<IsExact<typeof d2, string>>
                return true
            },
            orderOperator: (d1, d2) => {
                type _0 = Assert<IsExact<typeof d1, string>>
                type _1 = Assert<IsExact<typeof d2, string>>
                return 1
            },
        }),
    }
}
