# Installation

## From npm

You can install the library using npm:

`npm install rx-vdom`

Or yarn:

`yarn add rx-vdom`

## From CDN

A standalone example using a CDN is available <a href="{{URL-example-cdn}}" target="_blank">here</a> for reference.

--- 

# TypeScript Integration

## Setup

To fully integrate {{rx-vdom}} with TypeScript, you'll need to configure your project by adding a `rx-vdom.config.ts` 
file, which helps the TypeScript compiler properly type-check the virtual DOM elements. 
Once {{rx-vdom}} is installed, initialize the TypeScript configuration with the following command:

`yarn rx-vdom-init`


<note level='question' title="What does the `rx-vdom.config.ts` file do?" expandable="true">

The `rx-vdom.config.ts` file helps optimize compilation times by only considering the HTML tags you actually use 
in your project. By default, it includes all HTML tags, but you can limit the scope to a smaller set of tags for 
development, which speeds up compilation.

Here’s an example configuration:

<code-snippet language="javascript">
type AllTags = keyof HTMLElementTagNameMap
export interface Configuration {
    TypeCheck: 'strict'
    // This setup support all HTML tags
    SupportedHTMLTags: 'Prod' extends 'Prod' ? AllTags : DevTags
    // To support only the subset below ('Dev' can be 'Whatever' - as long it is not 'Prod'):
    // SupportedHTMLTags: 'Dev' extends 'Prod' ? AllTags : DevTags
}

// You can modify this list to suit your needs.
type DevTags =
    | 'div'
    | 'a'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'iframe'
    | 'i'
    | 'ul'
    | 'li'
    | 'span'
    | 'pre'
    | 'footer'
    | 'input'
    | 'button'
    | 'img'

</code-snippet>
</note>

## Type Checking

### Overview

TypeScript is highly effective at inferring the structure of {{rx-vdom}} components and the types of their attributes.
By leveraging TypeScript’s type system, you can improve your development experience and ensure the correct types are
used across your components.

<img src="../assets/error-<b>-no-href.png" class="w-100 my-1">
<img src="../assets/error-wrong-type.png" class="w-100 my-1">
<img src="../assets/style-wrong-type.png" class="w-100 my-1">


### Common Issues and Solutions

#### 1. HTML Tag Not Recognized

When working with TypeScript, the library configuration in `rx-vdom.config.ts` defines the set of HTML tags that
will be available for use. If you're in **Dev** mode (restricting tags), you may encounter errors about unrecognized HTML tags.

**Solution**:  
Switch to **Prod** mode if you're in **Dev** mode. If the error disappears, the missing tag was likely not included in your `DevTags` definition. You can add the required tag to the list.

#### 2. `vdomMap` Argument Inference

TypeScript may have difficulty inferring the argument type for the `vdomMap` callback, which is used to define 
reactive properties within the virtual DOM.

**Solution**:  

To help TypeScript infer the correct types, use the helper functions  
<api-link target='attr$' kind='function'></api-link>, 
<api-link target='child$' kind='function'></api-link>,
<api-link target='replace$' kind='function'></api-link>, 
<api-link target='append$' kind='function'></api-link>,
<api-link target='sync$' kind='function'></api-link>.

These functions ensure TypeScript can correctly infer the types and prevent compilation errors.

**Example:**

Instead of:

<code-snippet language="javascript">
const _: VirtualDOM<'div'> = {
    tag: 'div' as const,
    innerText: {
        source$: of('foo'),
        vdomMap: (m) => m,  // 'm' inferred as 'unknown'
    },
}
</code-snippet>

Use:

<code-snippet language="javascript">
const _: VirtualDOM<'div'> = {
    tag: 'div' as const,
    innerText: attr$({
        source$: of('foo'),
        vdomMap: (m) => m,  // 'm' inferred as 'string'
    }),
}
</code-snippet>

#### 3. `string` vs `Type Literal` Inference

A common issue arises when TypeScript infers a property as `string` rather than as a specific type literal 
like `'div'`. This can occur in properties such as `tag` or `style`.

**Solution**:  
Ensure that TypeScript treats string literals as specific types using `as const`.

**Example:**

Without `as const`:

<code-snippet language="javascript">
const child = {
    tag: 'div'  // Type inferred as 'string'
}

const parent: VirtualDOM<'div'> = {
    tag: 'div',
    children: [child]  // Error:  { tag: 'string' } can not be converted to { tag: SupportedHTMLTags }
}
</code-snippet>

With `as const`:

<code-snippet language="javascript">
const child = {
    tag: 'div' as const  // Type inferred as 'div'
}

const parent: VirtualDOM<'div'> = {
    tag: 'div',
    children: [child]  // No error
}
</code-snippet>

Similarly, apply `as const` for `style` properties to fix type inference issues:

<code-snippet language="javascript">

const divKo: VirtualDOM<'div'> = {
    tag: 'div',
    style: {
        textAlign: 'left'  // Inferred as 'string' instead of 'TextAlignProperty'   
    }
}

// Solution:
const divOk: VirtualDOM<'div'> = {
    tag: 'div',
    style: {
        textAlign: 'left' as const
    }
}
</code-snippet>

---

### Tips for Better TypeScript Development

- **Use helper functions** like `attr$`, `child$`, and `sync$` to define reactive attributes. These functions improve 
  type inference, ensuring that TypeScript can correctly infer the types in your code.

- **Check your `rx-vdom.config.ts`** configuration. If you encounter unusual errors, try switching to **Prod** mode 
  temporarily. This mode ensures that all HTML tags are considered, which may resolve issues with type checking.

- **Narrow down compilation errors** in nested VirtualDOM definitions by sequentially commenting out parts of the 
  VirtualDOM. This technique helps pinpoint the error's location, as the issue might be related to a direct or indirect
  parent node.
