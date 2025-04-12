# ToDo application

## Introduction

In this tutorial, we’ll build a simple but fully functional ToDo app that showcases how to manage state, handle user 
input, and display dynamic content reactively. Here is the final component that will be constructed:

<cell-output cell-id='final'>
</cell-output>


Throughout the tutorial, you'll see how to break down an app into reactive components, with a focus on state management
and the power of observables. We’ll walk through common interactions like adding and removing items, updating states, 
and applying reactive patterns to ensure the app responds fluidly to changes.

The <github-link target="examples">GitHub repository</github-link> includes 
the source code of the application as standalone projects, in JavaScript as well as Typescript.

Let's begin by installing the necessary dependencies:

<js-cell>
const { rxDom, rxjs } = await webpm.install({
    modules: [
        'rx-vdom#{{rxvdom-version}} as rxDom', 
        'rxjs#^7.5.6 as rxjs'
    ]
});
const {
    combineLatest,
    BehaviorSubject,
    skip,
    map,
    switchMap
} = rxjs
</js-cell>


## State

Your section is already clear and well-structured, but here's a refined version with improvements to flow, clarity, and tone—making it even easier to follow for readers at various levels:

---

## State Management

In {{rx-vdom}}, application state—i.e. the **business logic**—is typically managed using **observables**, which are 
later consumed within the virtual DOM via the `source$` property. 
This reactive approach enables a clean separation of concerns: the state is fully decoupled from the UI,
making your code easier to maintain, test, and reason about.

Whenever the application state changes, observables emit new values. These changes automatically propagate to any 
bound UI components, triggering updates without manual DOM manipulation.


Below is the implementation of the application state for the todo app:

<js-cell>

const Filter = {
    ALL: 1,
    ACTIVE: 2,
    COMPLETED: 3,
}

class State {
    constructor() {            
        const storageKey = '@rx-vdom/todo-app-js'
        this.items$ = new BehaviorSubject([])
        if (!localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, '[]')
        }
        this.items$.next(JSON.parse(localStorage.getItem(storageKey)))
        this.items$.subscribe((items) => {
            localStorage.setItem(storageKey, JSON.stringify(items))
        })

        this.completed$ = this.items$.pipe(
            map((items) => items.reduce((acc, item) => acc && item.done, true)),
        )
        this.remaining$ = this.items$.pipe(
            map((items) => items.filter((item) => !item.done)),
        )
        this.filterMode$ = new BehaviorSubject(Filter.ALL)
        this.filterFcts = {
            [Filter.ALL]: () => true,
            [Filter.ACTIVE]: (item) => !item.done,
            [Filter.COMPLETED]: (item) => item.done,
        }
        this.selectedItems$ = combineLatest([
            this.items$,
            this.filterMode$,
        ]).pipe(
            map(([items, mode]) =>
                items.filter((item) => this.filterFcts[mode](item)),
            ),
        )
    }

    toggleAll() {
        const completed = this.getItems().reduce(
            (acc, item) => acc && item.done,
            true,
        )
        this.items$.next(
            this.getItems().map((item) => ({
                id: item.id,
                name: item.name,
                done: !completed,
            })),
        )
    }

    addItem(name) {
        const item = { id: Date.now(), name, completed: false }
        this.items$.next([...this.getItems(), item])
        return item
    }

    deleteItem(id) {
        this.items$.next(this.getItems().filter((item) => item.id !== id))
    }

    toggleItem(id) {
        const items = this.getItems().map((item) =>
            item.id === id
                ? { id: item.id, name: item.name, done: !item.done }
                : item,
        )
        this.items$.next(items)
    }

    setName(id, name) {
        const items = this.getItems().map((item) =>
            item.id === id ? { id: item.id, name, done: item.done } : item,
        )
        this.items$.next(items)
    }

    getItems() {
        return this.items$.getValue()
    }

    setFilter(mode) {
        this.filterMode$.next(mode)
    }
}

const state = new State()
display(state)
</js-cell>

**Key Takeaways**

- **Decoupled logic**:  
  The `State` class contains no references to {{rx-vdom}} itself—it doesn’t depend on rendering, lifecycle, 
  or DOM logic. This ensures a clean architectural boundary between state and view layers.

- **Central observables: `items$` & `filterMode$`**  
  These are the core streams holding the state. All derived observables (`completed$`, `remaining$`, `selectedItems$`) 
  stem from them: they are the central source of truth for the application.

- **Immutable update pattern**:  
  State changes are handled by emitting **new arrays** via `items$.next(...)` or `filterMode$.next(mode)`, 
  rather than mutating data in place. This aligns well with reactive patterns and makes debugging and reasoning 
  about state transitions more straightforward.

- **Persistence**:  
  The todo list is persisted to `localStorage`, and restored on initialization.

With the application logic defined, let's proceed to designing the views.

## Views

### 'REPL' View

To kick things off, let's create a preliminary application that showcases the items as JSON objects.
The colors of these items will vary based on their status. Additionally, we'll enable interaction with the application
state, resembling a REPL (Read-Eval-Print Loop) user experience, leveraging the **`state`** symbol.

<js-cell>
const titleView = (title) => ({
    tag:'div', innerText: title, class:'text-primary'
})
const jsonItemView = (item) => ({
    tag: 'div',
    innerText: JSON.stringify(item),
    class: item.done ? 'text-success' : ''
})
const jsonItemsView = (items$)=>({
    tag: 'div',
    children: {
        policy: 'replace',
        source$: items$,
        vdomMap: (items) => items.map(jsonItemView)
    }
})
const replInputView = (state)=> ({
     tag:'input', class:'w-100', placeholder: "state.toggleAll()",
     onkeypress: (ev) => {
         ev.key == 'Enter' && new Function('state', ev.target.value)(state)
     }
})
let vDOM = {
    tag: 'div',
	children: [            
        titleView('Items'), 
        jsonItemsView(state.items$),
        titleView('Repl'), 
        replInputView(state)
    ]
}
display(vDOM)
</js-cell>

Here are a few examples of valid REPL expressions that can be entered:

- **`state.addItem('foo')`** (Adds a new item with the name 'foo')
- **`state.toggleAll()`** (Toggles the completion status of all items)

### Items View

Below are the definitions for displaying the list of items. Each item can be checked or unchecked,
its name can be modified (by double-clicking on it), and it can be deleted:

<js-cell>

const editionView = ({ item, state }) => {
    return {
        tag: 'input',
        type: 'text',
        class: 'edition-view',
        value: item.name,
        onclick: (ev) => {
            ev.stopPropagation()
        },
        onkeydown: (ev) => {
            const target = ev.target
            if (ev.key === 'Enter') {
                state.setName(item.id, target.value)
            }
        },
        onblur: (ev) => {
            const target = ev.target
            state.setName(item.id, target.value)
        },
    }
}
const presentationView = ({ item, editing$ }) => {
    return {
        tag: 'span',
        class: `presentation-view px-2 user-select-none ${
            item.done ? 'fv-text-disabled' : 'fv-text-focus'
        }`,
        style: { textDecoration: item.done ? 'line-through' : '' },
        innerText: item.name,
        ondblclick: () => {
            editing$.next(true)
        },
    }
}
const itemView = ({ state, item }) => {
    const editing$ = new BehaviorSubject(false)
    const baseClass =
        'btn btn-sm btn-light item-view-toggle border p-2 rounded-circle fv-text-success'

    return {
        tag: 'span',
        class: 'd-flex align-items-center my-1 justify-content-between fv-pointer',
        children: [
            {
                tag: 'button',
                class: baseClass + (item.done ? ' fas fa-check' : ''),
                style: { width: '30px', height: '30px' },
                onclick: () => {
                    state.toggleItem(item.id)
                },
            },
            {
                source$: editing$,
                vdomMap: (editing) =>
                    editing
                        ? editionView({ state, item })
                        : presentationView({ item, editing$ }),
                sideEffects: (rxElem) => {
                    rxElem.element.focus()
                },
            },
            {
                tag: 'div',
                class: 'item-view-remove btn btn-sm fas fa-times text-danger mx-2 p-1',
                onclick: () => {
                    state.deleteItem(item.id)
                },
            },
        ],
    }
}

const itemsView = ({ state, filterMode$ }) => {
    const filters = {
        All: () => true,
        Active: (item) => !item.done,
        Completed: (item) => item.done,
    }
    const selectedItems$ = combineLatest([state.items$, filterMode$]).pipe(
        map(([items, mode]) => items.filter((item) => filters[mode](item))),
    )
    return {
        tag: 'div',
        class: 'border border-bottom-0 w-100 p-2 mx-auto overflow-auto',
        style: {
            minHeight: '200px',
        },
        children: {
            policy: 'replace',
            source$: selectedItems$,
            vdomMap: (items) => items.map((item) => itemView({ item, state })),
        },
    }
}

const filterMode$ = new BehaviorSubject('All')
vDOM = {
    tag: 'div',
    class:'rounded mx-auto',
    children: [
        itemsView({state, filterMode$})
    ]
}

display(vDOM)

</js-cell>

### Header View

Below is the implementation of the header view, which allows users to add new items and provides a toggle button
to mark all items as done or not done:

<js-cell>
const newItemView = ({ state }) => {
    return {
        tag: 'header',
        class: 'd-flex align-items-center my-3 justify-content-center',
        style: {
            fontSize: 'x-large',
        },
        children: [
            {
                tag: 'i',
                class: {
                    source$: state.completed$,
                    vdomMap: (completed) =>
                        completed ? 'btn-primary' : 'btn-light',
                    wrapper: (d) =>
                        `${d} new-item-view-toggle-all fas fa-chevron-down p-2 m-1 btn btn-sm rounded-circle`,
                },
                onclick: () => {
                    state.toggleAll()
                },
            },
            {
                tag: 'input',
                autofocus: true,
                autocomplete: 'off',
                placeholder: 'What needs to be done?',
                class: 'new-item-input new-todo px-2 border-bottom',
                style: {
                    border: 'none',
                    fontStyle: 'italic',
                },
                onkeydown: (ev) => {
                    const target = ev.target
                    if (ev.key === 'Enter') {
                        state.addItem(target.value)
                    }
                },
            },
        ],
    }
}

vDOM = {
    tag:'div',
    class:'rounded p-2 w-100 fv-bg-primary',
    children: [{
        tag: 'div',
        class: 'todo-app d-flex flex-column justify-content-center',
        children: [
            {
                tag: 'div',
                class: 'h1 text-center my-3',
                innerText: 'Todos',
            }, 
            newItemView({ state }),
            itemsView({ state, filterMode$ }) 
        ]
    }]
}

display(vDOM)

</js-cell>

### Final view

To complete the application, let's add a footer:

<js-cell>
const footerView = ({ state, filterMode$ }) => {

    const toggleBtn = (target) => ({
        tag: 'i',
        innerText: target,
        class: {
            source$: filterMode$,
            vdomMap: (mode) =>
                mode === target ? 'rounded btn-primary' : 'btn-light',
            wrapper: (d) => `${target} ${d} btn btn-sm mx-2`
        },
        onclick: () => {
            filterMode$.next(target)
        },
    })
    return {
        tag: 'div',
        class: 'd-flex align-items-center px-3 border py-2 text-secondary',
        children: [
            {
                tag: 'span',
                innerText: {
                    source$: state.remaining$,
                    vdomMap: (items) => `${String(items.length)} items left`,
                },
            },
            {
                tag: 'div',
                class: 'd-flex align-items-center mx-auto',
                children: [
                    {
                        tag: 'i',
                        class: 'fas fa-filter px-2',
                    },
                    toggleBtn('All'),
                    toggleBtn('Active'),
                    toggleBtn('Completed')
                ],
            },
        ],
    }
}

const helpView = () => {
    return {
        tag: 'div',
        class: 'my-3',
        children: [
            {
                tag: 'p',
                class: 'text-center',
                innerText: 'Double-click on an item to edit',
            },
            {
                tag: 'p',
                class: 'text-center',
                target: "_blank",
                innerHTML:
                    "This is a reproduction of the <a href='https://codesandbox.io/s/github/vuejs/vuejs.org/tree/master/src/v2/examples/vue-20-todomvc?from-embed'>todos example of Vue</a>",
            },
        ],
    }
}

vDOM = {
    tag:'div',
    class:'rounded p-2 w-100 fv-bg-primary',
    children: [
        {
            tag: 'div',
            class: 'todo-app d-flex flex-column justify-content-center',
            children: [
                {
                    tag: 'div',
                    class: 'h1 text-center my-3',
                    innerText: 'Todos',
                }, 
                newItemView({ state }),
                itemsView({ state, filterMode$ }),
                footerView({ state, filterMode$ }),
                helpView()
            ]
	    }
    ]
}

display(vDOM)
</js-cell>

The next cell simply display the final view at the top of the page (the view port is deported):

<js-cell cell-id="final">
display(vDOM)
</js-cell>
