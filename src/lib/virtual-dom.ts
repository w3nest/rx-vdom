import {
    AttributeLike,
    ChildrenLike,
    ExposedMembers,
    RxElementTrait,
    CustomAttribute,
    CSSAttribute,
    NativeHTMLElement,
    RenderHook,
} from './api'
import { factory, SupportedHTMLTags, TypeCheck } from './factory'
/**
 * Represents a Virtual DOM element that mirrors the structure and characteristics of an HTML DOM element.
 * It allows attributes and children to be supplied reactively via the concept of **observable** (from reactive
 * programming).
 *
 * A `VirtualDOM` is converted in regular `HTMLElement` using the {@link render} function.
 *
 * @template Tag The tag name of the DOM element.
 */
export type VirtualDOM<Tag extends SupportedHTMLTags> = {
    /**
     * The tag of the element, equivalent to the `tagName` property of `HTMLElement`.
     */
    tag: Tag

    /**
     * The class associated with the element, equivalent to the `className` property of `HTMLElement`.
     */
    class?: AttributeLike<string>

    /**
     * The style associated with the element. Typically, for a static value:
     * ```typescript
     * {
     *      tag: 'div',
     *      style: {
     *          backgroundColor: 'blue'
     *      }
     * }
     * ```
     * For more details on hyphenated properties, see {@link CSSAttribute}.
     */
    style?: AttributeLike<CSSAttribute>

    /**
     * Additional custom attributes for the element.
     * For example, the attributes 'aria-label' and 'aria-expanded' in the following:
     * ```html
     * <button aria-label="Close" aria-expanded="false"></button>
     * ```
     * would be represented in the virtual DOM as:
     * ```typescript
     * {
     *      tag: 'button',
     *      customAttributes: {
     *          ariaLabel: 'Close',
     *          ariaExpanded: false
     *      }
     * }
     * ```
     * For more details on hyphenated properties, see {@link CustomAttribute}.
     */
    customAttributes?: AttributeLike<CustomAttribute>

    /**
     * Children of the element.
     */
    children?: ChildrenLike

    /**
     * Lifecycle hook called just after the element has been attached to the document's DOM.
     *
     * @param element A reference to the attached HTML element.
     */
    connectedCallback?: (element: RxHTMLElement<Tag>) => void

    /**
     * Lifecycle hook called just after the element has been detached from the document's DOM.
     *
     * @param element A reference to the detached HTML element.
     */
    disconnectedCallback?: (element: RxHTMLElement<Tag>) => void

    /**
     * An array of functions executed on this element and all its descendants
     * the first time they are rendered in the viewport.
     */
    onRender?: RenderHook[]
} & (TypeCheck extends 'none'
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Index signature effectively optional if `TypeCheck` is disabled
      Record<string, any>
    : Partial<ExposedMembers<NativeHTMLElement<Tag>>>)

/**
 * Represents the actual HTMLElement rendered from a {@link VirtualDOM}.
 * It implements the standard HTMLElement API for the corresponding tag,
 * enhanced with the {@link RxElementTrait | reactive trait}.
 *
 * @template Tag The tag name of the DOM element.
 */
export type RxHTMLElement<Tag extends SupportedHTMLTags> = RxElementTrait &
    NativeHTMLElement<Tag>

/**
 * Transforms a {@link VirtualDOM} into a corresponding {@link RxHTMLElement}.
 *
 * > The HTML element returned is initialized **only when attached** to the document's DOM tree.
 *
 * @param vDom The virtual DOM to render.
 * @param onRender An array of rendering hooks executed when the element and its descendants are displayed.
 * They are added to those defined in the `VirtualDOM` using `onRender` in {@link VirtualDOM}.
 * @returns The corresponding DOM element.
 */
export function render<Tag extends SupportedHTMLTags>(
    vDom: VirtualDOM<Tag>,
    onRender: RenderHook[] = [],
): RxHTMLElement<Tag> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!vDom) {
        console.error("Falsy VirtualDOM provided to 'render'")
        vDom = ErrorDiv as unknown as VirtualDOM<Tag>
    }
    // For Javascript mostly, we allow missing 'tag' property...
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const tag = vDom.tag || ('div' as const)
    const renderHooks = [...onRender, ...(vDom.onRender ?? [])]
    vDom.onRender = renderHooks
    const element: RxHTMLElement<Tag> = factory<Tag>(tag as unknown as Tag)
    element.initializeVirtualDom(vDom)
    renderHooks.forEach((hook) => {
        hook(element)
    })
    return element
}

/**
 * A Virtual DOM resolving to an empty `div`.
 */
export const EmptyDiv: VirtualDOM<'div'> = { tag: 'div' }

export const ErrorDiv: VirtualDOM<'div'> = {
    tag: 'div',
    style: { width: '25px' },
    innerHTML: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
<path fill='red' d="M512 288.9c-.5 17.4-15.2 31.1-32.7 31.1H424v16c0 21.9-4.9 42.6-13.6 61.1l60.2 60.2c12.5 12.5 12.5 32.8 0 45.3-12.5 12.5-32.8 12.5-45.3 0l-54.7-54.7C345.9 468 314.4 480 280 480V236c0-6.6-5.4-12-12-12h-24c-6.6 0-12 5.4-12 12v244c-34.4 0-65.9-12-90.6-32.1l-54.7 54.7c-12.5 12.5-32.8 12.5-45.3 0-12.5-12.5-12.5-32.8 0-45.3l60.2-60.2C92.9 378.6 88 357.9 88 336v-16H32.7C15.2 320 .5 306.3 0 288.9-.5 270.8 14 256 32 256h56v-58.7l-46.6-46.6c-12.5-12.5-12.5-32.8 0-45.3 12.5-12.5 32.8-12.5 45.3 0L141.3 160h229.5l54.6-54.6c12.5-12.5 32.8-12.5 45.3 0 12.5 12.5 12.5 32.8 0 45.3L424 197.3V256h56c18 0 32.5 14.8 32 32.9zM257 0c-61.9 0-112 50.1-112 112h224C369 50.1 318.9 0 257 0z"/>
</svg>`,
}
