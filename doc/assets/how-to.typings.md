# Type safety

We have placed significant emphasis on providing comprehensive type checking for virtual DOM elements,
aligning them with their corresponding HTML elements.
This results in an enhanced development experience when using TypeScript. For example:

<img src="../assets/error-<b>-no-href.png" class="w-100 my-1">
<img src="../assets/error-wrong-type.png" class="w-100 my-1">
<img src="../assets/style-wrong-type.png" class="w-100 my-1">

# Common compilation issues

<note level="hint">
In case of a compilation error in a nested VirtualDOM definition, a good strategy is to sequentially comment out parts 
of the VirtualDOM to narrow down the error location. Sometimes, the error reported by the compiler is associated with
a direct or indirect parent of the problematic node.
</note>

## HTML tag not recognized

As explained on the [installation page](@nav/how-to/install), the TypeScript configuration of the library relies on a
`rx-vdom.config.ts` file. This file defines all the supported HTML tags. Using `type Mode = 'Prod'` handles all HTML
tags, while `type Mode = 'Dev'` restricts to a subset, speeding up compilation.

If you are not using `Prod` mode and encounter obscure compilation errors, switch back to `Prod` mode.
If the error disappears, add the missing HTML tags used in your project's VirtualDOM to the `DevTags` type definition.
The tags can usually be identified from the error messages.

## Type inference limitations

TypeScript is generally effective at inferring the recursive structure of the VirtualDOM and the types of 
associated attributes. However, there are a few limitations that users may encounter.


### `vdomMap` argument inference

One current limitation is the inability of TypeScript to correctly infer the argument type for the `vdomMap` callback, 
which is used to define reactive properties within the VirtualDOM.

To help TypeScript infer the correct types, you should use the helper functions 
<api-link target='attr$' kind='function'></api-link>, 
<api-link target='child$' kind='function'></api-link>,
<api-link target='replace$' kind='function'></api-link>, 
<api-link target='append$' kind='function'></api-link>,
<api-link target='sync$' kind='function'></api-link>.

These functions are specifically designed to guide TypeScript's type inference, ensuring it correctly understands 
the types in your code. Their purpose is solely type inferance, as their implementation reduced to just returns 
`(d) => d`.


For instance, instead (resulting in compile-time error):

<code-snippet language="javascript" highlightedLines="2-7">
const _: VirtualDOM<'div'> = {
    tag: 'div' as const,
    innerText: {
        source$: of('foo'),
        // Below, m is inferred as 'unknown', 
        // not compatible with 'string' as required for 'innerText'
        vdomMap: (m) => m,
    },
}
</code-snippet>

Use:

<code-snippet language="javascript" highlightedLines="2-5">
const _: VirtualDOM<'div'> = {
    tag: 'div' as const,
    innerText: attr$({
        source$: of('foo'),
        vdomMap: (m) => m, // m is inferred as 'string'
    }),
}
</code-snippet>

### `string` vs `type literal` inference

A common problem encountered is typescript inferring a property as string, while the intention is to have
a type literal.

For instance in the following snippet:

<code-snippet language="javascript" highlightedLines="9">
// child is inferred as { tag: 'string' } and not { tag: 'div' }
const child = {
    tag: 'div' // adding ' as const' fix the issue 
}

const parent : VirtualDOM<'div'> = {
    tag: 'div',
    children: [
        // Problem: { tag: 'string' } can not be converted to { tag: SupportedHTMLTags }
        child
    ]
}
</code-snippet>

The `tag` property of `child` is inferred as `string` while the intention is to have the type literal `div`.
Which leads in an error in the definition of parent at the line highlighted. The solutions are:

- Annotate the type of `child` with `Virtual<'div'>`
- Provide `tag: 'div' as const` instead `tag: 'div'` in `child`.
- Inline the definition of `child` within `parent`.

The same issue can arise when defining style, for instance this is invalid:

<code-snippet language="javascript" highlightedLines="8">
const style = {
    textAlign: 'left' // adding ' as const' fix the issue 
}

const div: VirtualDOM<'div'> = {
    tag: 'div',
    // Types of property 'textAlign' are incompatible.
    // Type 'string' is not assignable to type 'TextAlignProperty'.
    style,
}
</code-snippet>

Using `textAlign: 'left' as const` resolves the issue.
