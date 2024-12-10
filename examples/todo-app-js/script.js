const webpm = window.webpm

const { RxVDom, RxJS } = await webpm.install({
    esm: ['rx-vdom#^0.1.1 as RxVDom', 'rxjs#^7.5.6 as RxJS'],
    css: [
        'bootstrap#5.3.3~bootstrap.min.css',
        'fontawesome#5.12.1~css/all.min.css',
    ],
})

const { BehaviorSubject, combineLatest, map } = RxJS
const Filter = {
    ALL: 1,
    ACTIVE: 2,
    COMPLETED: 3,
}
class AppState {
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

function titleView() {
    return {
        tag: 'h1',
        class: 'text-center my-3',
        innerText: 'Todos',
    }
}

function editionView({ item, state }) {
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
function presentationView({ item, editing$ }) {
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
function itemView({ state, item }) {
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

function itemsView({ state, filterMode$ }) {
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

function newItemView({ state }) {
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

function footerView({ state, filterMode$ }) {
    const toggleBtn = (target) => ({
        tag: 'i',
        innerText: target,
        class: {
            source$: filterMode$,
            vdomMap: (mode) =>
                mode === target ? 'rounded btn-primary' : 'btn-light',
            wrapper: (d) => `${target} ${d} btn btn-sm mx-2`,
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
                    toggleBtn('Completed'),
                ],
            },
        ],
    }
}

function helpView() {
    return {
        tag: 'div',
        class: 'my-3',
        children: [
            {
                tag: 'p',
                class: 'text-center',
                innerText: 'Double click on an item to edit',
            },
            {
                tag: 'p',
                class: 'text-center',
                innerHTML:
                    "This is a reproduction of the <a href='https://codesandbox.io/s/github/vuejs/vuejs.org/tree/master/src/v2/examples/vue-20-todomvc?from-embed'>todos example of Vue</a>",
            },
        ],
    }
}

function appView({ state }) {
    const filterMode$ = new BehaviorSubject('All')
    return {
        tag: 'div',
        class: 'p-3 d-flex flex-column mx-auto',
        style: {
            maxWidth: '500px',
        },
        children: [
            titleView(),
            newItemView({ state }),
            itemsView({ state, filterMode$ }),
            footerView({ state, filterMode$ }),
            helpView(),
        ],
    }
}
const div = RxVDom.render(appView({ state: new AppState() }))
document.body.appendChild(div)
