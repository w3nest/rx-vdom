## Welcome to the **rx-vdom** API Documentation  

**rx-vdom** is a reactive virtual DOM library designed to enhance declarative UI development. 
It revolves around the {@link VirtualDOM} structure, which is transformed into standard `HTMLElement` instances 
using {@link render}.  

**Key Concepts**

A `VirtualDOM` represents an `HTMLElement` where attributes and children can be defined as either plain values or observables, enabling reactivity. This allows seamless updates when data changes. Reactivity is handled through:

- **Attributes**: Defined reactively using {@link RxAttribute}.
- **Single Child**: Managed reactively using {@link RxChild}.
- **Multiple Children**: Handled using {@link RxChildren}, with three update policies:
  - {@link ChildrenOptionsReplace}: Replaces all children when the observable emits a new value.
  - {@link ChildrenOptionsAppend}: Appends new children while preserving existing ones.
  - {@link ChildrenOptionsSync}: Synchronizes additions and removals based on the observable’s state.

**TypeScript Support**

For better type inference in TypeScript, use the helper functions {@link attr$}, {@link child$}, {@link replace$}, 
{@link append$}, and {@link sync$}. These functions have no runtime effect beyond returning their provided argument,
ensuring strong typing without additional overhead.

This API documentation provides an in-depth guide to utilizing **rx-vdom** for building highly reactive and efficient 
web applications.

