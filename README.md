
# ![rx-vdom Logo](./assets/logo.png)

Open source package for observable-based declarative DOM representations.

## Features

- **Compact Size & Dependency-Free:** The compressed bundle size is less than *5 kB*. Reactivity,
  usually with [RxJS](https://rxjs.dev/), is opt-in by the consumer.
  The library is only necessary for rendering components; defining them does not require it.

- **Simple & Consistent API:** The API is minimal, building directly on standard HTML and reactive programming
  principles.

- **Type Safety:** Supported by the strongly-typed **VirtualDOM** structure,
  it provides robust type checking and inline guidance within a TypeScript environment.

## Installation

Install via npm or yarn:

```sh
npm install rx-vdom
```
or
```sh
yarn add rx-vdom
```

Alternatively, you can include the library directly from a CDN with a <script> tag:

```html
<script src="
https://cdn.jsdelivr.net/npm/rx-vdom@latest/dist/rx-vdom.min.js
"></script>
```

## Configuration

In a TypeScript environment, you need to configure `rx-vdom.config.ts`. This file can be automatically generated 
and referenced in your `tsconfig.json` using the following command:

```sh
npx rx-vdom-init
```
or
```sh
yarn rx-vdom-init
```

The configuration file optimizes compilation time by ensuring only the HTML tags you actually use are included in
the build process.

## Basic Usage

```typescript
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
```

## Documentation

For detailed tutorials, usage examples, and the full API specification, visit the
[documentation](https://w3nest.org/apps/@rx-vdom/doc/latest).


## License

MIT License. See [LICENSE](LICENSE) for details.

