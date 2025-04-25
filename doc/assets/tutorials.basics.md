# Getting Started

Welcome to the tutorial. We begin by setting up the necessary dependencies required to run 
this page:

<js-cell>
const { rxDom, rxjs } = await webpm.install({
    esm: [
        'rx-vdom#{{rxvdom-version}} as rxDom', 
        'rxjs#^7.5.6 as rxjs'
    ]
});
</js-cell>

This installation includes:

- **{{rx-vdom}}** — the lightweight reactive Virtual DOM library we’ll be exploring in this tutorial.

- **<ext-link target="rxjs">RxJS</ext-link>** — the reactive engine behind the scenes. 
  It’s a JavaScript implementation of the <ext-link target="reactivex">ReactiveX</ext-link> programming model, 
  which allows you to handle asynchronous data streams in a declarative way.

## VirtualDOM

The <api-link target='VirtualDOM' kind='type-alias'></api-link> mirrors the characteristics and structure of an HTML DOM 
element with the ability for its attributes and children to be supplied through time dependent variables modeled 
using **Observable**.

<note level='info'>
The Observable model allows you to treat streams of asynchronous events with the same sort of simple, composable 
operations that you use for collections of data items like arrays.
</note>

Virtual DOMs can be converted into actual HTML elements using the <api-link target="render" kind="function"></api-link>
function. The resulting element not only represents the standard HTML implementation for the specified tag but also 
incorporates additional reactive features, as defined by the 
<api-link target='RxHTMLElementTrait' kind='type-alias'></api-link>. 
These added features primarily enhance lifecycle management, which is discussed further later on this page.

Here’s a first example: we define a basic static virtual DOM, transform it to HTML element that is finally 
display.


<js-cell>
let vDOM = { 
     tag: 'div',
     class:'d-flex align-items-center rounded p-2 bg-light',
     children: [
         { tag: 'i', class:'fas fa-check text-success'},
         { tag: 'i', class:'mx-1' },
         { tag: 'div', innerText:'Introduces vDOM' }
     ]
}
const htmlElement = rxDom.render(vDOM)
display(htmlElement)
</js-cell>

To define a VirtualDOM node, only the **`tag`** property is required—this corresponds to the `tagName` of a 
regular `HTMLElement` (see <api-link target="SupportedHTMLTags" kind="type-alias"></api-link>).

A VirtualDOM element can also include the following attributes:

- **`class`**: Equivalent to the `className` property of `HTMLElement`.  
- **`style`**: Inline styles applied to the element 
  (see <api-link target="CSSAttribute" kind="type-alias"></api-link>).  
- **`children`**: A list of VirtualDOM child elements. You can also provide regular `HTMLElement` instances to smooth 
  integration with third-party UI components or manually created elements 
  (see <api-link target="ChildLike" kind="type-alias"></api-link>).
- **`customAttributes`**: Additional custom attributes for the element
  (see <api-link target="CustomAttribute" kind="type-alias"></api-link>).
- Any other standard attribute supported by the corresponding HTML tag 
  (see <api-link target="ExposedMembers" kind="type-alias"></api-link>).


Each of these can be provided as either a **static value** or defined **reactively** using an observable.

Reactive attributes are expressed as objects with at least two properties:

- **`source$`** — an Observable emitting values over time.  
- **`vdomMap`** — a function that maps each emitted value to a VirtualDOM fragment or attribute value.

In the following sections, different uses of reactivity to define either attributes, a child, or children are provided.
The examples are based on the following domain data object:

<note level="hint" icon="fas fa-code" title="Data: Famous Physicists" expandable="true" mode="stateful">

<js-cell>
const physicists = [
    {
        name: "Albert Einstein",
        synopsis: `Known for the theory of relativity, which revolutionized the understanding of space, time, and 
gravity. His famous equation E = mc^2 established the relationship between mass and energy.`
    },
    {
        name: "Niels Bohr",
        synopsis: `A pioneer in quantum mechanics, he developed the Bohr model of the atom, which introduced the theory
of electrons orbiting the nucleus in quantized energy levels.`
    },
    {
        name: "Werner Heisenberg",
        synopsis: `Formulated the Heisenberg Uncertainty Principle, which states that the position and momentum of a 
particle cannot both be precisely determined at the same time.`
    },
    {
        name: "Erwin Schrödinger",
        synopsis: `Known for the Schrödinger equation, a fundamental equation of quantum mechanics that describes how 
the quantum state of a physical system changes with time.`
    },
    {
        name: "Richard Feynman",
        synopsis: `Made significant contributions to quantum electrodynamics (QED) and developed the Feynman diagrams,
a graphical representation of particle interactions.`
    },
    {
        name: "Paul Dirac",
        synopsis: `Known for the Dirac equation, which describes the behavior of fermions and predicted the existence 
of antimatter.`
    },
    {
        name: "Max Planck",
        synopsis: `Considered the father of quantum theory, he introduced the concept of energy quanta and the Planck 
constant.`
    },
    {
        name: "Wolfgang Pauli",
        synopsis: `Formulated the Pauli Exclusion Principle, which states that no two electrons can occupy the same 
quantum state simultaneously within a quantum system.`
    },
    {
        name: "Louis de Broglie",
        synopsis: `Proposed the wave-particle duality theory, which suggests that particles can exhibit both wave-like 
and particle-like properties.`
    },
    {
        name: "David Bohm",
        synopsis: `Known for his work in quantum theory and his interpretation of quantum mechanics,
the Bohmian mechanics, which offers an alternative to the standard Copenhagen interpretation.`
    }
]
</js-cell>

</note>

---

## Rx Attribute

A reactive attribute (<api-link target="RxAttribute" kind="interface"></api-link>) is an attribute 
( _e.g._ `class`, `id`, `style`) of the virtual DOM that is bound to an observable.
The following example picks a random physicist among the above list and displays their name.

<js-cell>
const rndPhysicist$ = rxjs.timer(0, 1000).pipe(
    rxjs.map((tick) => {
        const index = Math.floor(Math.random() * physicists.length);
        return physicists[index];
    })
)
vDOM = {
   tag: 'div',
   class: 'bg-light text-center',
   innerText: {
      source$: rndPhysicist$,
      vdomMap: (physicist) => physicist.name,
   },
}

display(vDOM)
</js-cell>

In this example, the **`innerText`** attribute of the virtual DOM is bound to the observable
**`rndPhysicist$`**. This observable defines the logic of the application by picking a random physicist from the
list every second. The **`vdomMap`** function converts this domain data into a view element.

<note level='hint'>
A convention is to suffix reactive variables with `$`.
</note>

Additional parameters such as `wrapper`, `untilFirst`, and `sideEffects` can be provided when defining a reactive
attribute. More information can be found in the <api-link target="RxAttribute" kind="interface"></api-link>
API documentation.

---

## Rx Child

A reactive child (<api-link target="RxChild" kind="interface"></api-link>) is a child element in a virtual DOM that is
bound to an observable. It shares the same API as reactive attributes, with the primary distinction being that the 
`vdomMap` function returns a VirtualDOM rather than a value.

To illustrate, let’s first define a view for a physicist. This view will be called by the `vdomMap` callback,
which is triggered by a given physicist’s data:

<js-cell>
const physicistView = (physicist) => {
	return {
        tag: 'div',
    	class:'p-2 my-1 border rounded bg-light', 
        children: [
            {
                tag: 'div',
                style:{ fontWeight: 'bolder' },
                innerText: physicist.name
            },
            {
                tag: 'div',
                class: 'text-justify',
                innerText: physicist.synopsis.replace(/\n/g, '')
            },
        ]
    }
}
</js-cell>

<note level='hint'>
When defining style attribute, the keys can be provided either using their standard names
(*e.g.* `'font-weight'`) or their camel case versions (like here, `'fontWeight'`).
</note>

Next, let’s create a dropdown that allows users to select a physicist from a list. 
The selected physicist’s details will be rendered as a reactive child:

<js-cell>

const selectView = (items) => {
    const selected$ = new rxjs.BehaviorSubject(items[0])
    return {
        tag:'select',
        selected$,
        children: items.map((p) => ({
            tag:'option',
            innerText: p.name,
        })),
        onchange: (ev) => selected$.next(items[ev.target.selectedIndex])
    }
}
const physicistDropDown = selectView(physicists)
vDOM = {
    tag: 'div',
    class:'p-2',
    children:[
        physicistDropDown,
        {
            source$: physicistDropDown.selected$,
            vdomMap: physicistView
        }
    ]
}
display(vDOM)
</js-cell>

Just like reactive attributes, reactive child also accepts attributes such as `untilFirst`, `wrapper` & `sideEffects`.
More information can be found in <api-link target="RxChild" kind="interface"></api-link> API documentation.

---

## Rx Children

The concept of reactive children (<api-link target="RxChildren" kind="type-alias"></api-link>) involves a vDOM's entire 
list of children being bound to an observable.
Three policies are available:

- `append` : All children are appended at every emission of new items from `source$`.
- `replace` : All children are replaced each time a new item(s) is emitted by `source$`.
- `sync` : Synchronizes only the updated, new, or deleted children when `source$` emits a list of
  (usually immutable) data.

### Append Policy

The **`append`** uses a **`source$`** attribute that emits a list of new items, appending them to the existing
rendered elements using the **`vdomMap`** function, which takes one item and provides the associated
virtual DOM.

Here is an example that displays the 5 first random physicists (from `rndPhysicist$` previously defined):

<js-cell>
vDOM = {
    tag: 'div',
    class: 'd-flex flex-column',
    children:{
        policy: 'append',
        source$: rndPhysicist$.pipe(
            // append policy source$ requires a list of new data
            rxjs.map( p => [p]),
            // limit the stream to 5 data
            rxjs.take(5)
        ),
        vdomMap: physicistView,
        orderOperator: (a, b) => a.name.localeCompare(b.name)
    }
}    
display(vDOM)
</js-cell>

In this example, the optional **`orderOperator`** is provided to list the randomly picked items by their name
(in alphabetical order). If none is provided, items are appended in the order of emission from **`source$`**.

<note level='warning' label="Important">
For the **`orderOperator`** to take effect, the parent container should have a `display` style property set to either
`flex` or `grid`.
</note>

Additional information can be found in the <api-link target="ChildrenOptionsAppend" kind="interface"></api-link>
API documentation.

### Replace Policy

The **`replace`** policy uses a **`source$`** attribute that emits any type of data (even though it is typically a
collection) and produces a list of Virtual DOMs through its **`vdomMap`** attribute.
When new views are produced by this function, all previously rendered elements are cleared and then the new
views appended.

<note level='warning' label='Performances'>
This policy is not performance-optimized, as the entire list of children is recreated with each emission of 
**`source$`**. In some cases, it is preferable to avoid recreating elements that remain unchanged between emissions.
The next **`sync`** policy addresses this scenario.
</note>

Here is an example:

<js-cell>
const buttonView = (title) => {
    const click$ = new rxjs.Subject()
    return {
        tag: 'div',
        class: 'btn btn-secondary',
        innerText: title,
        onclick: (ev) => click$.next(ev),
        click$
    }
}

const pickerBtn = buttonView("Pick 3 physicists")

const threeRndPhysicist$ = pickerBtn.click$.pipe(rxjs.map(()=> {
    let r = new Set()
    while(r.size<3){
        const index = Math.floor(Math.random() * physicists.length);
        r.add(physicists[index])
    }
    return Array.from(r)
    })
)
vDOM = {
    tag: 'div',
    class: 'd-flex flex-column',
    children:[
        pickerBtn,
        {
            tag:'div',
            class: 'd-flex flex-column',
            children: {
                policy: 'replace',
                source$: threeRndPhysicist$,
                vdomMap: (physicists) => physicists.map(physicistView),
            }
        }
    ]
}    
display(vDOM)
</js-cell>

<note level='info'>
Here, it is the responsibility of the caller to sort the items within the **`vdomMap`** function if needed.
There is no **`orderOperator`** attribute available.
</note>

Additional information can be found in the <api-link target="ChildrenOptionsReplace" kind="interface"></api-link>
API documentation.

### Sync Policy

The **`sync`** policy takes a **`source$`** attribute that emit a list of items, refreshing the list of
rendered elements using the **`vdomMap`** function, which takes one item of the list and provides the associated
virtual DOM. When refreshing, the following actions take place:

- New HTML elements are created and added for the new domain data.
- HTML elements for domain data not present in the new list are removed.
- Remaining HTML elements are left unchanged, except for potential reordering within the parent container.

<js-cell>
vDOM = {
    tag: 'div',
    class: 'd-flex flex-column',
    children:[
        pickerBtn,
        {
            tag:'div',
            class: 'd-flex flex-column',
            children: {
                policy: 'sync',
                source$: threeRndPhysicist$,
                vdomMap: physicistView,
                orderOperator: (a, b) => a.name.localeCompare(b.name)
            }
        }
    ]
}
display(vDOM)

</js-cell>

<note level='info' title="Cold vs Hot Observables" expandable="true">

The `pickerBtn` references the same VirtualDOM used in the previous **Replace Policy** section.
Clicking on it will refresh both the list above and the one in the previous section simultaneously 
(a single VirtualDOM can be associated with multiple `HTMLElement` instances).

The reason why the actual list displayed differs between sections is that `threeRndPhysicist$` is a cold observable. 
This means that every time the observable is subscribed to, the logic inside the `pipe` runs again, 
generating a new set of random physicists.

In contrast, a hot observable shares the same values across multiple subscribers without executing the logic 
again for each subscription. To make `threeRndPhysicist$` hot, you could use the
<ext-link target="shareReplay"> shareReplay </ext-link> operator, which would cause the observable to replay the
last emitted values to new subscribers, ensuring that the same set of physicists is displayed across multiple 
places without re-triggering the random selection.

Understanding whether an observable is cold or hot can impact how your app behaves, especially when you're managing 
side effects, like data fetching or random number generation, across different parts of your application. 
</note>

The output is very similar to the previous example, with the following key differences:

- Only the changes between consecutive emissions are rendered. Identical elements between one emission of
  **`source$`** and the next are not re-rendered. By default, elements are compared using reference equality.
  You can provide a custom comparison function with the **`comparisonOperator`** attribute.
- The **`vdomMap`** function takes a single item from the list emitted by **`source$`** as its argument.
- The **`orderOperator`** option is available to control the display order, which is applicable only for flex or
  grid layouts.

Additional information can be found in the <api-link target="ChildrenOptionsSync" kind="interface"></api-link>
API documentation.

---

## `HTMLElement` & Lifecycle

In some situations—such as integrating third-party libraries—you may need direct access to the actual HTML element
produced by a VirtualDOM. You may also want to execute logic when the element is inserted into or removed from 
the document.

To support these scenarios, {{rx-vdom}} allows VirtualDOM to define lifecycle hooks:

*  **`connectedCallback`**:
Invoked when the corresponding `HTMLElement` is added to the document.
It receives an <api-link target="RxHTMLElement" kind="type-alias"></api-link>, including helper methods such
as `ownSubscriptions` and `hookOnDisconnected` to simplify resource management.

*  **`disconnectedCallback`**:
Invoked when the `HTMLElement` is removed from the DOM.
It receives the same <api-link target="RxHTMLElement" kind="type-alias"></api-link> enhanced element instance and is 
typically used for cleanup logic.


**Example**

The following example illustrates the use of connectedCallback, disconnectedCallback, and lifecycle management 
in the context of rendering a live-updating chart using the
 <ext-link target="chartjs">Chart.js</ext-link> library:

<js-cell >
const { chartJs } = await webpm.install({
    esm:['chart.js#^3.9.1 as chartJs'],
})
chartJs.registerables.forEach((plot)=>chartJs.Chart.register(plot))

const rndPt = () => ({x:Math.random(), y:Math.random()})
const data$ = rxjs.timer(0,1000).pipe(
    rxjs.map(() => Array.from({length: 100}, rndPt))
)

vDOM = { 
    tag: 'div',
    class:`d-flex flex-column border text-center rounded p-2 h-100 w-100`,
    children: [
        {
            tag:'canvas',
            class:'mx-auto w-75',
            connectedCallback: (htmlElement) => {
                const plot = new chartJs.Chart(
                    htmlElement, 
                    { 
                        type: 'scatter',
                        data: { datasets: [{label:'Rnd'}] }
                    }
                )
                const sub = data$.subscribe( (d) => {
                    plot.data.datasets[0].data = d
                    plot.update()
                })
                htmlElement.ownSubscriptions(sub)
                htmlElement.hookOnDisconnected(() => plot.clear())
            },
            disconnectedCallback: (htmlElement) =>  {
                console.log("Canvas element removed from the DOM")
            }
        }
    ]
}
display(vDOM)
</js-cell>

<note level="info"> 
A given VirtualDOM may be rendered in multiple locations. In such cases, 
the `connectedCallback` will be called for each individual instance, each time with a unique `HTMLElement`.

<js-cell> 
display(vDOM) 
</js-cell>
</note> 

---

## Conclusion

In this tutorial, we've covered the key concepts and the API of {{rx-vdom}}. 
You should have a solid understanding of how to work with VirtualDOM, bind it to reactive data streams,
and manage lifecycle events. 

With this foundation, building more complex applications now revolves around effectively managing state through 
observable manipulation. 
In the <cross-link target="todoApp">next tutorial</cross-link>, we'll dive into creating a ToDo app, 
applying what we've learned here to build a practical, real-world application. 