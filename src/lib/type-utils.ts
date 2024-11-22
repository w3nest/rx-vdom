/**
 * Gathers low level operations on types.
 *
 * @module
 */

import {
    AnyHTMLAttribute,
    AnyVirtualDOM,
    RxAttribute,
    RxChild,
    RxChildren,
} from './api'

/* eslint-disable @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/no-unnecessary-type-parameters */

/**
 * Check whether 2 types are equals.
 *
 * See [type level equal operator](https://github.com/Microsoft/TypeScript/issues/27024) and
 * [distributive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
 *
 */
export type Equals<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
        ? true
        : false

/**
 * Extract the writable keys of a type.
 *
 * Taken from this [SO discussion](https://stackoverflow.com/questions/52443276/how-to-exclude-getter-only-properties-from-type-in-typescript)
 */
export type WritableKeysOf<T> = {
    [P in keyof T]: Equals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] }
    > extends true
        ? P
        : never
}[keyof T]

/* eslint-enable @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/no-unnecessary-type-parameters */

/**
 * Extract writable part of a type.
 *
 * @template T type to transform
 */
export type WritablePart<T> = Pick<T, WritableKeysOf<T>>

/**
 * Type inference helper for constructing an {@link RxAttribute}.
 * This function has no runtime behavior beyond directly returning the input
 * argument.
 *
 * Use this helper to infer types when defining reactive attributes.
 *
 * @template TDomain The domain type associated with the attribute.
 * @template Target The HTML attribute type to which this applies.
 * @param attr The reactive attribute definition.
 * @returns The provided attribute definition.
 */
export function attr$<TDomain, Target extends AnyHTMLAttribute>(
    attr: RxAttribute<TDomain, Target>,
) {
    return attr
}

/**
 * Type inference helper for constructing an {@link RxChild}.
 * This function has no runtime behavior beyond directly returning the input
 * argument.
 *
 * Use this helper to infer types when defining reactive child elements.
 *
 * @template TDomain The domain type associated with the child.
 * @template TVDom The virtual DOM type of the child.
 * @param child The reactive child definition.
 * @returns The provided child definition.
 */
export function child$<TDomain, TVDom extends AnyVirtualDOM>(
    child: RxChild<TDomain, TVDom>,
) {
    return child
}
/**
 * Type inference helper for constructing {@link RxChildren} with the 'replace'
 * policy.
 * This function has no runtime behavior beyond directly returning the input
 * argument.
 *
 * Use this helper to infer types when defining reactive children with the
 * 'replace' policy.
 *
 * @template TDomain The domain type associated with the children.
 * @param children The reactive children definition with the 'replace' policy.
 * @returns The provided children definition.
 */
export function replace$<TDomain>(children: RxChildren<'replace', TDomain>) {
    return children
}

/**
 * Type inference helper for constructing {@link RxChildren} with the 'sync'
 * policy.
 * This function has no runtime behavior beyond directly returning the input
 * argument.
 *
 * Use this helper to infer types when defining reactive children with the
 * 'sync' policy.
 *
 * @template TDomain The domain type associated with the children.
 * @param children The reactive children definition with the 'sync' policy.
 * @returns The provided children definition.
 */
export function sync$<TDomain>(children: RxChildren<'sync', TDomain>) {
    return children
}

/**
 * Type inference helper for constructing {@link RxChildren} with the 'append'
 * policy.
 * This function has no runtime behavior beyond directly returning the input
 * argument.
 *
 * Use this helper to infer types when defining reactive children with the
 * 'append' policy.
 *
 * @template TDomain The domain type associated with the children.
 * @param children The reactive children definition with the 'append' policy.
 * @returns The provided children definition.
 */
export function append$<TDomain>(children: RxChildren<'append', TDomain>) {
    return children
}
