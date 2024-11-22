import { VirtualDOM, attr$ } from '../../lib'
import { of } from 'rxjs'
import { AssertTrue as Assert, IsExact } from 'conditional-type-checks'
import { ResolvedHTMLElement, RxAttribute } from '../../lib/api'

const source$ = of('https://foo.com')
{
    // RxAttribute, not type hints
    const _: VirtualDOM<'a'> = {
        tag: 'a',
        href: {
            source$,
            // @ts-expect-error -- href is expected to be string, but here s is 'unknown'
            vdomMap: (s) => {
                // This should pass ideally: type _ = Assert<IsExact<typeof s, string>>
                return s
            },
            // @ts-expect-error -- untilFirst needs to be a string
            untilFirst: 42,
            // @ts-expect-error -- wrapper should return a string
            wrapper: (href) => {
                type _ = Assert<IsExact<typeof href, string>>
                return 42
            },
            sideEffects: (element) => {
                // the resolved element can not be known here (this is the parent)
                type _ = Assert<
                    IsExact<typeof element, ResolvedHTMLElement<unknown>>
                >
            },
        },
    }
}

{
    // RxAttribute, RxAttribute type hints KO
    const _: VirtualDOM<'a'> = {
        tag: 'a',
        // @ts-expect-error -- because of untilFirst type & wrapper return type
        href: {
            source$,
            vdomMap: (s) => {
                type _ = Assert<IsExact<typeof s, string>>
                return s
            },
            untilFirst: 42,
            wrapper: (href) => {
                type _ = Assert<IsExact<typeof href, string>>
                return 42
            },
            sideEffects: (element) => {
                // the resolved element can not be known here (it corresponds to the parent)
                type _ = Assert<
                    IsExact<typeof element, ResolvedHTMLElement<string>>
                >
            },
        } as RxAttribute<string, string>,
    }
}

{
    // RxAttribute, RxAttribute type hints OK
    const _: VirtualDOM<'a'> = {
        tag: 'a',
        href: attr$({
            source$,
            vdomMap: (s) => {
                type _ = Assert<IsExact<typeof s, string>>
                return s
            },
            untilFirst: 'https://until-first-anchor',
            wrapper: (href) => {
                type _ = Assert<IsExact<typeof href, string>>
                return href.replace('https', 'http')
            },
            sideEffects: (element) => {
                // the resolved element can not be known here (it corresponds to the parent)
                type _ = Assert<
                    IsExact<typeof element, ResolvedHTMLElement<string>>
                >
            },
        }),
    }
}

{
    // RxAttribute, RxAttribute type hints KO
    const _: VirtualDOM<'a'> = {
        tag: 'a',
        // @ts-expect-error -- because of untilFirst type & wrapper return type
        href: attr$({
            source$,
            // @ts-expect-error -- because of untilFirst type & wrapper return type
            vdomMap: (s) => {
                type _ = Assert<IsExact<typeof s, string>>
                return s
            },
            untilFirst: 42,
            wrapper: (href) => {
                // @ts-expect-error -- href is infered as number
                type _ = Assert<IsExact<typeof href, string>>
                return 42
            },
            sideEffects: (element) => {
                // the resolved element can not be known here (it corresponds to the parent)
                type _ = Assert<
                    IsExact<typeof element, ResolvedHTMLElement<string>>
                >
            },
        }),
    }
}
