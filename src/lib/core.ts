import {
    CustomElementsMap,
    SupportedHTMLTags,
    customElementPrefix,
} from './factory'
import {
    instanceOfStream,
    RxStream,
    instanceOfChildrenStream,
    RxStreamAppend,
    RxStreamSync,
    RxStreamChildren,
} from './rx-stream'
import { VirtualDOM, RxHTMLElement, render } from './virtual-dom'
import {
    AnyVirtualDOM,
    AttributeLike,
    AnyHTMLAttribute,
    ChildrenPolicy,
    Observable,
    RenderHook,
    RxAttribute,
    RxChild,
    RxChildren,
    Subscription,
    CSSAttribute,
} from './api'
import pkgJson from '../../package.json'

class HTMLPlaceHolderElement extends HTMLElement {
    private currentElement: HTMLElement

    initialize(
        stream$: RxStream<unknown, AnyVirtualDOM>,
        onRender?: RenderHook[],
    ): Subscription {
        this.currentElement = this

        const apply = (vDom: AnyVirtualDOM): HTMLElement => {
            const div = render(vDom, onRender)
            this.currentElement.replaceWith(div)
            this.currentElement = div
            return div
        }
        return stream$.subscribe(
            (vDom: AnyVirtualDOM) =>
                apply(vDom) as RxHTMLElement<SupportedHTMLTags>,
        )
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TS2545: A mixin class must have a constructor with a single rest parameter of type 'any[]'.
type Constructor<T extends HTMLElement> = new (...args: any[]) => T

type SpecialAttribute = 'class' | 'style' | 'customAttributes'

function isSpecialAttribute(d: string): d is SpecialAttribute {
    return ['class', 'style', 'customAttributes'].includes(d)
}

const specialBindings: Record<
    SpecialAttribute,
    (instance: HTMLElement, v: unknown) => void
> = {
    class: (instance: HTMLElement, value: string) =>
        (instance.className = value),
    style: (instance: HTMLElement, value: CSSAttribute) => {
        Object.entries(value).forEach(([k, v]: [string, string]) => {
            instance.style[k] = v
        })
    },
    customAttributes: (
        instance: HTMLElement,
        value: Record<string, string>,
    ) => {
        Object.entries(value).forEach(([k, v]) => {
            instance.setAttribute(k.replace(/[A-Z]/g, '-$&').toLowerCase(), v)
        })
    },
}

function isInstanceOfObservable(d: unknown): d is Observable<unknown> {
    return typeof d === 'object' && d !== null && 'subscribe' in d
}
function isInstanceOfRxAttribute(d: unknown): d is RxAttribute {
    return typeof d === 'object' && d !== null && 'source$' in d
}
function isInstanceOfRxChild(d: unknown): d is RxChild {
    return typeof d === 'object' && d !== null && 'source$' in d
}
function isInstanceOfRxChildren(d: unknown): d is RxChildren<ChildrenPolicy> {
    return typeof d === 'object' && d !== null && 'source$' in d
}

type ConvertedAttributeLike =
    | AnyHTMLAttribute
    | RxStream<unknown, AnyHTMLAttribute>

type ConvertedChildLike =
    | AnyVirtualDOM
    | HTMLElement
    | RxStream<unknown, AnyVirtualDOM>

function extractRxStreams<Tag extends SupportedHTMLTags>(
    vDom: Readonly<VirtualDOM<Tag>>,
): {
    attributes: [string, ConvertedAttributeLike][]
    children:
        | ConvertedChildLike[]
        | RxStream<unknown, AnyVirtualDOM[]>
        | RxStreamChildren<unknown>
} {
    const allAttributes = Object.entries(vDom).filter(
        ([k]) =>
            k !== 'tag' &&
            k !== 'children' &&
            k !== 'connectedCallback' &&
            k !== 'disconnectedCallback',
    )

    const attributes: [string, ConvertedAttributeLike][] = allAttributes
        .filter(([, v]) => v !== undefined)
        .map(
            ([k, attribute]: [
                string,
                Exclude<AttributeLike<AnyHTMLAttribute>, undefined>,
            ]) => {
                if (isInstanceOfObservable(attribute)) {
                    return [
                        k,
                        new RxStream<AnyHTMLAttribute, AnyHTMLAttribute>(
                            attribute,
                            (d) => d,
                            {},
                        ),
                    ]
                }
                if (isInstanceOfRxAttribute(attribute)) {
                    return [
                        k,
                        new RxStream<unknown, AnyHTMLAttribute>(
                            attribute.source$,
                            attribute.vdomMap,
                            {
                                wrapper: attribute.wrapper,
                                sideEffects: attribute.sideEffects,
                                untilFirst: attribute.untilFirst,
                            },
                        ),
                    ]
                }
                return [k, attribute]
            },
        )

    if (!vDom.children) {
        return { attributes, children: [] }
    }
    if (Array.isArray(vDom.children)) {
        const children = vDom.children
            .filter((child) => child !== undefined && child !== false)
            // The next type assertion over `child` is for projects compiled with `strictNullCheck: false`
            .map((child: HTMLElement | RxChild | AnyVirtualDOM) => {
                if (isInstanceOfRxChild(child)) {
                    return new RxStream<unknown, AnyVirtualDOM>(
                        child.source$,
                        child.vdomMap,
                        {
                            wrapper: child.wrapper,
                            sideEffects: child.sideEffects,
                            untilFirst: child.untilFirst,
                        },
                    )
                }
                return child
            })
        return { attributes, children }
    }
    if (!isInstanceOfRxChildren(vDom.children)) {
        console.error('Type of children unknown', vDom.children)
        return { attributes, children: [] }
    }
    if (!['replace', 'append', 'sync'].includes(vDom.children.policy)) {
        console.error('Unknown RxChildren policy', vDom.children)
        return { attributes, children: [] }
    }
    if (vDom.children.policy === 'replace') {
        const children = new RxStream(
            vDom.children.source$,
            vDom.children.vdomMap,
            {
                wrapper: vDom.children.wrapper,
                sideEffects: vDom.children.sideEffects,
                untilFirst: vDom.children.untilFirst,
            },
        )
        return { attributes, children }
    }
    if (vDom.children.policy === 'append') {
        const children = new RxStreamAppend(
            vDom.children.source$,
            vDom.children.vdomMap,
            {
                sideEffects: vDom.children.sideEffects,
                orderOperator: vDom.children.orderOperator,
            },
        )
        return { attributes, children }
    }
    const children = new RxStreamSync(
        vDom.children.source$,
        vDom.children.vdomMap,
        {
            comparisonOperator: vDom.children.comparisonOperator,
            sideEffects: vDom.children.sideEffects,
            orderOperator: vDom.children.orderOperator,
        },
    )
    return { attributes, children }
}

/**
 * An interface that defines the added functionalities over regular `HTMLElement` of an {@link RxHTMLElement}
 * (generated using the {@link render} function).
 *
 * The resource cleanup process upon element disconnection follows these steps:
 * 1. Unsubscribe all subscriptions registered via `ownSubscriptions`, in reverse order (LIFO).
 * 2. Execute any hooks registered via `hookOnDisconnected`, in reverse order (LIFO).
 * 3. Finally, invoke the optional `disconnectedCallback` defined in the associated {@link VirtualDOM}.
 *
 * @template Tag The associated HTML tag.
 */
export interface RxHTMLElementTrait<Tag extends SupportedHTMLTags> {
    /**
     * The associated Virtual DOM.
     */
    vDom: Readonly<VirtualDOM<Tag>>
    /**
     * Adds subscriptions to the element, marking them as "owned" by it.
     *
     * When the element is removed from the DOM, all owned subscriptions are automatically unsubscribed.
     *
     * @param subs - The subscriptions to be owned by this element. They will be unsubscribed upon disconnection.
     */
    ownSubscriptions(...subs: Subscription[])
    /**
     * Registers callbacks to be invoked when the element is disconnected from the DOM.
     *
     * This method is useful for performing additional resource cleanup or other actions when the element is
     * removed from the DOM.
     *
     * @param callbacks - The functions to be executed when the element is disconnected from the DOM.
     */
    hookOnDisconnected(...callbacks: (() => void)[])
}

/**
 * Transforms a regular `HTMLElement` into a reactive one by augmenting it with reactive capabilities.
 * This allows you to manage the lifecycle of subscriptions and provides additional hooks for DOM events,
 * such as when the element is added or removed from the page.
 *
 * The returned class extends the provided base `HTMLElement` constructor and implements {@link RxHTMLElementTrait}.
 *
 * @param Base The base constructor of the regular HTMLElement.
 * @returns A class that extends the provided `Base` constructor and adds reactive functionality to it.
 * @template T The type of the constructor of the regular HTMLElement.
 * @template Tag The associated HTML tag.
 */
export function ReactiveTraitGenerator<
    T extends Constructor<HTMLElement>,
    Tag extends SupportedHTMLTags,
>(Base: T) {
    return class extends Base implements RxHTMLElementTrait<Tag> {
        vDom: Readonly<VirtualDOM<Tag>>

        subscriptions = new Array<Subscription>()

        disconnectionHooks: (() => void)[] = []

        initializeVirtualDom(vDom: VirtualDOM<Tag>) {
            this.vDom = vDom
        }

        connectedCallback() {
            const { attributes, children } = extractRxStreams<Tag>(this.vDom)

            attributes
                .filter(([, v]) => !instanceOfStream(v))
                .forEach(([k, v]: [k: string, v: AnyHTMLAttribute]) => {
                    this.applyAttribute(k, v)
                })

            attributes
                .filter(([, v]) => instanceOfStream(v))
                .forEach(
                    ([k, attr$]: [
                        k: string,
                        attr$: RxStream<AnyHTMLAttribute>,
                    ]) => {
                        this.subscriptions.push(
                            attr$.subscribe((v: AnyHTMLAttribute) => {
                                this.applyAttribute(k, v)
                                return this as unknown as RxHTMLElement<Tag>
                            }, this),
                        )
                    },
                )
            if (Array.isArray(children)) {
                this.renderChildren(children)
            }
            if (instanceOfStream<unknown, AnyVirtualDOM[]>(children)) {
                this.subscriptions.push(
                    children.subscribe((children) => {
                        this.replaceChildren()
                        this.renderChildren(children)
                        return this as unknown as RxHTMLElement<Tag>
                    }),
                )
            }

            if (instanceOfChildrenStream(children)) {
                this.subscriptions.push(
                    children.subscribe(
                        this as unknown as RxHTMLElement<Tag>,
                        this.vDom.onRender,
                    ),
                )
            }
            const userConnectedCallback = this.vDom.connectedCallback
            if (userConnectedCallback !== undefined) {
                // Defer the user-provided connectedCallback to the next animation frame.
                // This is necessary for Safari with the custom-elements polyfill, where
                // connectedCallback may fire before the element's subtree has been rendered.
                // Using requestAnimationFrame ensures the DOM is fully painted before the callback runs.
                // It's safe to keep this for all browsers and does not have negative impact
                requestAnimationFrame(() => {
                    userConnectedCallback(this as unknown as RxHTMLElement<Tag>)
                })
            }
        }

        disconnectedCallback() {
            this.subscriptions.reverse().forEach((s) => {
                s.unsubscribe()
            })
            this.disconnectionHooks.reverse().forEach((cb) => {
                cb()
            })
            this.vDom.disconnectedCallback?.(
                this as unknown as RxHTMLElement<Tag>,
            )
        }

        renderChildren(children: ConvertedChildLike[]): HTMLElement[] {
            const rendered: HTMLElement[] = []
            children.forEach((child) => {
                if (instanceOfStream(child)) {
                    const placeHolder = document.createElement(
                        `${customElementPrefix}-placeholder`,
                    ) as HTMLPlaceHolderElement
                    this.appendChild(placeHolder)
                    this.subscriptions.push(
                        placeHolder.initialize(child, this.vDom.onRender),
                    )
                    rendered.push(placeHolder)
                } else if (child instanceof HTMLElement) {
                    this.appendChild(child)
                } else {
                    const div = render(child, this.vDom.onRender)
                    this.appendChild(div)
                    rendered.push(div)
                }
            })
            return rendered
        }

        applyAttribute(name: string, value: AnyHTMLAttribute) {
            if (isSpecialAttribute(name)) {
                specialBindings[name](this, value)
                return
            }
            this[name] = value
        }

        ownSubscriptions(...subs: Subscription[]) {
            this.subscriptions.push(...subs)
        }

        hookOnDisconnected(...callbacks: (() => void)[]) {
            this.disconnectionHooks.push(...callbacks)
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
function registerElement<Tag extends SupportedHTMLTags>(
    tag: Tag,
    BaseClass: typeof HTMLElement,
) {
    class ExtendedClass extends ReactiveTraitGenerator<typeof BaseClass, Tag>(
        BaseClass,
    ) {}
    customElements.define(
        `${customElementPrefix}-${tag}`,
        ExtendedClass as CustomElementConstructor,
        { extends: tag },
    )
}

export function register() {
    if (customElements.get(`${customElementPrefix}-placeholder`)) {
        console.warn(
            `rx-vdom with api version ${pkgJson.webpack.apiVersion} has already defined custom elements`,
        )
        return
    }

    customElements.define(
        `${customElementPrefix}-placeholder`,
        HTMLPlaceHolderElement,
    )

    Object.entries(CustomElementsMap).forEach(
        ([tag, HTMLElementClass]: [
            tag: SupportedHTMLTags,
            typeof HTMLElement,
        ]) => {
            registerElement(tag, HTMLElementClass)
        },
    )
}

register()
