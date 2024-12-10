# ToDo application

## Introduction

This page offers guidance on creating and structuring an application.
We'll explore the classic example of a todos application:

<cell-output cell-id='final'>
</cell-output>

The <a target="_blank" href="https://github.com/w3nest/rx-vdom/tree/main/examples">GitHub repository</a> includes 
the source code of the application as standalone projects, in JavaScript as well as Typescript.

Let's begin by installing the necessary dependencies:

<js-cell>
const { rxDom, rxjs, httpClients } = await webpm.install({
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

In {{rx-vdom}}, the state of the application (i.e. business logic) is typically managed through observables,
consumed at any point in time as **`source$`** observables by the vDOM.
This allows for a clear separation of concerns and helps to keep the code organized and easy to maintain.
When a change occurs in the state of the application, the relevant observables emit new values,
which in turn trigger automatic updates in the corresponding elements of views.

Regarding the todo application, the application state is presented below, description is provided using inlined
comments:

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

Key points regarding the **`State`** definition:

- It is independent of the views and does not consume any {{rx-vdom}} symbols.
  This promotes a clean separation of concerns, making the codebase easier to understand, maintain and test.
- The state data is treated as immutable. Instead of directly modifying the state, the methods **`toggleAll`**,
  **`addItem`**, **`deleteItem`**, **`toggleItem`** and **`setName`** create new copies of the state with the desired
  modifications and emit them through the **`__items$`** subject. This helps in avoiding unintended side effects and 
  simplifies reasoning about state changes.

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

The next cell simply display the final view at the top of the page:
<js-cell cell-id="final">
display(vDOM)
</js-cell>
