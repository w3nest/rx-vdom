import {
    SupportedHTMLTags,
    VirtualDOM,
    ResolvedHTMLElement,
    child$,
} from '../../lib'
import { of } from 'rxjs'
import { AssertTrue as Assert, IsExact } from 'conditional-type-checks'

const source$ = of('https://foo.com')

{
    // RxChild, no type hints
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: [
            {
                source$,
                vdomMap: (href) => {
                    // This should pass ideally: type _ = Assert<IsExact<typeof href, string>>
                    return {
                        tag: 'b',
                        // can not catch this error like that
                        href,
                        // and this one neither
                        foo: 5,
                    }
                },
                sideEffects: (elem) => {
                    type _ = Assert<
                        IsExact<
                            typeof elem,
                            ResolvedHTMLElement<unknown, SupportedHTMLTags>
                        >
                    >
                    // There is not type inference here: available are only the properties of HTMLElement
                    const _0 = elem.element.innerText
                    // @ts-expect-error -- href is not available on any html elements
                    const _1 = elem.element.href
                },
            },
        ],
    }
}

{
    // RxChild partially typed & vdomMap
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: [
            {
                source$,
                vdomMap: (href: string): VirtualDOM<'b'> => {
                    type _ = Assert<IsExact<typeof href, string>>
                    return {
                        // @ts-expect-error -- 'a' is not 'b'
                        tag: 'a',
                        href,
                    }
                },
                sideEffects: (elem) => {
                    const _0 = elem.element.innerText
                    // @ts-expect-error -- href is not available on 'b'
                    const _1 = elem.element.href
                },
            },
        ],
    }
}

{
    // RxChild, RxChild type hints OK
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: [
            child$({
                source$,
                vdomMap: (href) => {
                    type _ = Assert<IsExact<typeof href, string>>
                    return {
                        tag: 'a',
                        href,
                    }
                },
                wrapper: (from) => {
                    type Tag = Pick<typeof from, 'tag'>
                    type _ = Assert<IsExact<Tag, { tag: 'a' }>>
                    return from
                },
                sideEffects: (elem) => {
                    type _ = Assert<
                        IsExact<typeof elem, ResolvedHTMLElement<string, 'a'>>
                    >
                    type _0 = Assert<
                        IsExact<typeof elem.element.innerText, string>
                    >
                    type _1 = Assert<IsExact<typeof elem.element.href, string>>
                },
            }),
        ],
    }
}

{
    // RxChild, RxChild type hints KO: tag mismatch
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: [
            child$({
                source$,
                // @ts-expect-error -- no tag
                vdomMap: (href) => {
                    type _ = Assert<IsExact<typeof href, string>>
                    return {
                        // can not catch this error like that
                        href,
                        // and this one neither
                        foo: 5,
                    }
                },
            }),
        ],
    }
}

{
    // RxChild, RxChild type hints KO: tag mismatch
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: [
            child$({
                source$,
                vdomMap: (href) => {
                    type _ = Assert<IsExact<typeof href, string>>
                    return {
                        tag: 'b',
                        // can not catch this error like that
                        href,
                        // and this one neither
                        foo: 5,
                    }
                },
                wrapper: (from) => {
                    return from
                },
                sideEffects: (elem) => {
                    type _ = Assert<
                        // @ts-expect-error -- 'b' is not 'a'
                        IsExact<typeof elem, ResolvedHTMLElement<string, 'a'>>
                    >
                    const _0 = elem.element.innerText
                    // @ts-expect-error -- 'b' is not 'a'
                    const _1 = elem.element.href
                },
            }),
        ],
    }
}

{
    // RxChild, RxChild type hints KO: wrong side effects
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: [
            child$({
                source$,
                vdomMap: (href) => {
                    type _ = Assert<IsExact<typeof href, string>>
                    return {
                        tag: 'b',
                    }
                },
                wrapper: (from) => {
                    return from
                },
                sideEffects: (elem) => {
                    type _ = Assert<
                        IsExact<typeof elem, ResolvedHTMLElement<string, 'b'>>
                    >
                    const _0 = elem.element.innerText
                    // @ts-expect-error -- href not available in 'b'
                    const _1 = elem.element.href
                },
            }),
        ],
    }
}

{
    const _: VirtualDOM<'div'> = {
        tag: 'div',
        children: [
            child$({
                source$,
                vdomMap: (href) => {
                    type _ = Assert<IsExact<typeof href, string>>
                    if (Math.random() > 0.5) {
                        const a: VirtualDOM<'a'> = {
                            tag: 'a',
                            href,
                        }
                        return a
                    }
                    const b: VirtualDOM<'b'> = {
                        tag: 'b',
                        // @ts-expect-error -- href is not available on 'b'
                        href,
                    }
                    return b
                },
                wrapper: (vdom) => {
                    type _ = Assert<
                        IsExact<typeof vdom, VirtualDOM<'a'> | VirtualDOM<'b'>>
                    >
                    return vdom
                },
                sideEffects: (elem) => {
                    type _ = Assert<
                        IsExact<
                            typeof elem,
                            ResolvedHTMLElement<string, 'a' | 'b'>
                        >
                    >
                    const _0 = elem.element.innerText
                    // @ts-expect-error -- href is not available on 'b'
                    const _1 = elem.element.href
                },
            }),
        ],
    }
}
