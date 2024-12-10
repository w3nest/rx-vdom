# rx-vdom 

<code-badges version="{{rxvdom-version}}" npm="rx-vdom" github="w3nest/rx-vdom" license="mit">
</code-badges>

--- 

**Open source package for observable-based declarative DOM representations.**

Key features of the library include:

- **Compact Size & Dependency-Free:** The compressed bundle size is <rx-vdom-size></rx-vdom-size>. Reactivity,
  usually with [RxJS](https://rxjs.dev/), is opt-in by the consumer.
- **Simple & Consistent API:** The API is minimal, building directly on standard HTML and reactive programming
  principles.
- **Type Safety:** Supported by the strongly-typed <api-link target='VirtualDOM' kind='type-alias'></api-link> structure,
  it provides robust type checking and inline guidance within a TypeScript environment.

---

## Example Usage

The following example illustrates the core concepts of **rx-vdom**: reactivity is explicitly handled using
observables. The library's role is to connect the observables to the relevant parts of the HTML, allowing the
DOM to automatically update in response to changes in data.

<code-snippet language='javascript'>
import { render } from 'rx-vdom'
import { timer } from 'rxjs'
// Create an observable emitting values every second
const time$ = timer(0, 1000)

render({
    tag: 'div',
    class: 'border rounded p-1',
    children: [
        {
            tag: 'i',
            // Bind the class attribute to the observable
            class: {
                source$: time$,
                // Toggle green color every other second
                vdomMap: (tick) => (tick % 2 ? 'text-success' : ''),
                // Add clock icon class
                wrapper: (d) => `${d} fas fa-clock`,
            },
        },
        // Bind a child element to the observable
        {
            source$: time$,
            vdomMap: () => ({
                tag: 'i',
                class: 'mx-1',
                // Display current time
                innerText: new Date().toLocaleTimeString(),
            }),
        },
    ]
})
</code-snippet>

<example-home></example-home>

<note level="hint">
The example above highlights the majority of the library's API in action.
Once familiar with it, you'll find that the core logic of your application is primarily driven by how observables 
are structured, independent of the library itself.
For instance, RxJs offers a rich collection of <a href="https://rxjs.dev/guide/operators" target="_blank">operators</a> 
to address a wide range of scenarios effectively.
</note>

---

## Learn More

*  Dive into the [tutorial](@nav/tutorials/basics) to get started.
*  Check out the  [how-to](@nav/how-to) section for guidance on installation and usage within TypeScript environments.
*  Explore the [API documentation](@nav/api) for details about the library's capabilities. 
*  Find examples like a fully functional "todos" application (in JavaScript and TypeScript) on 
   <a target="_blank" href="https://github.com/w3nest/rx-vdom/tree/main/examples">GitHub</a>.
