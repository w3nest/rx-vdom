import { ChildrenLike, VirtualDOM, child$, attr$, replace$ } from 'rx-vdom'
import { BehaviorSubject, combineLatest, Observable, map } from 'rxjs'
import { State, Item } from './state'

type FilterMode = 'All' | 'Active' | 'Completed'

export class TitleView implements VirtualDOM<'h1'> {
    static readonly ClassName = 'title-view'

    public readonly tag = 'h1'
    public readonly class = `${TitleView.ClassName} text-center my-3`
    public readonly innerText = 'Todos'
}

/**
 * @category View
 */
export class ItemView implements VirtualDOM<'span'> {
    static readonly ClassName = 'item-view'
    public readonly tag = 'span'
    public readonly class = `${ItemView.ClassName} d-flex align-items-center my-1 justify-content-between fv-pointer`
    public readonly children: ChildrenLike
    public readonly state: State
    public readonly item: Item
    private readonly editing$ = new BehaviorSubject<boolean>(false)

    constructor(
        item: { id: number; name: string; done: boolean },
        state: State,
    ) {
        Object.assign(this, { item, state })

        const baseClass =
            'btn btn-sm btn-light item-view-toggle border p-2 rounded-circle fv-text-success'
        this.children = [
            {
                tag: 'button',
                class: baseClass + (item.done ? ' fas fa-check' : ''),
                style: { width: '30px', height: '30px' },
                onclick: () => {
                    state.toggleItem(item.id)
                },
            },
            child$({
                source$: this.editing$,
                vdomMap: (editing) =>
                    editing ? this.editionView() : this.presentationView(),
                sideEffects: (rxElem) => {
                    rxElem.element.focus()
                },
            }),
            {
                tag: 'div',
                class: 'item-view-remove btn btn-sm fas fa-times text-danger mx-2 p-1',
                onclick: () => {
                    state.deleteItem(item.id)
                },
            },
        ]
    }

    presentationView(): VirtualDOM<'span'> {
        return {
            tag: 'span',
            class: `presentation-view px-2 user-select-none ${
                this.item.done ? 'fv-text-disabled' : 'fv-text-focus'
            }`,
            style: { textDecoration: this.item.done ? 'line-through' : '' },
            innerText: this.item.name,
            ondblclick: () => {
                this.editing$.next(true)
            },
        }
    }

    editionView(): VirtualDOM<'input'> {
        return {
            tag: 'input',
            type: 'text',
            class: 'edition-view',
            value: this.item.name,
            onclick: (ev) => {
                ev.stopPropagation()
            },
            onkeydown: (ev: KeyboardEvent) => {
                const target = ev.target as HTMLInputElement
                if (ev.key === 'Enter') {
                    this.state.setName(this.item.id, target.value)
                }
            },
            onblur: (ev) => {
                const target = ev.target as HTMLInputElement
                this.state.setName(this.item.id, target.value)
            },
        }
    }
}

export class ItemsView implements VirtualDOM<'div'> {
    static readonly ClassName = 'items-view'
    public readonly tag = 'div'
    public readonly class = `${ItemsView.ClassName} border border-bottom-0 w-100 p-2 mx-auto overflow-auto`
    public readonly style = {
        minHeight: '200px',
    }
    public readonly children: ChildrenLike

    private filters: Record<FilterMode, (item: Item) => boolean> = {
        All: () => true,
        Active: (item) => !item.done,
        Completed: (item) => item.done,
    }

    constructor(state: State, filterMode$: Observable<FilterMode>) {
        const selectedItems$ = combineLatest([state.items$, filterMode$]).pipe(
            map(([items, mode]) =>
                items.filter((item) => this.filters[mode](item)),
            ),
        )

        this.children = replace$({
            policy: 'replace',
            source$: selectedItems$,
            vdomMap: (items) => items.map((item) => new ItemView(item, state)),
        })
    }
}

export class NewItemView implements VirtualDOM<'header'> {
    static readonly ClassName = 'new-item-view'
    public readonly tag = 'header'
    public readonly children: ChildrenLike
    public readonly class = `${NewItemView.ClassName} d-flex align-items-center my-3 justify-content-center`
    public readonly style = {
        fontSize: 'x-large',
    }

    constructor(state: State) {
        this.children = [
            {
                tag: 'i',
                class: attr$({
                    source$: state.completed$,
                    vdomMap: (completed): string =>
                        completed ? 'btn-primary' : 'btn-light',
                    wrapper: (d) =>
                        `${d} new-item-view-toggle-all fas fa-chevron-down p-2 m-1 btn btn-sm rounded-circle`,
                }),
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
                onkeydown: (ev: KeyboardEvent) => {
                    const target = ev.target as HTMLInputElement
                    if (ev.key === 'Enter') {
                        state.addItem(target.value)
                    }
                },
            },
        ]
    }
}

export class FooterView implements VirtualDOM<'div'> {
    static readonly ClassName = 'footer-item-view'
    public readonly tag = 'div'
    public readonly class = `${FooterView.ClassName} d-flex align-items-center px-3 border py-2 text-secondary`
    public readonly children: ChildrenLike

    constructor(state: State, filterMode$: BehaviorSubject<FilterMode>) {
        const class$ = (target: FilterMode) =>
            attr$({
                source$: filterMode$,
                vdomMap: (mode): string =>
                    mode === target ? 'rounded btn-primary' : 'btn-light',
                wrapper: (d) => `${target} ${d} btn btn-sm mx-2`,
            })

        this.children = [
            {
                tag: 'span',
                innerText: attr$({
                    source$: state.remaining$,
                    vdomMap: (items) => `${String(items.length)} items left`,
                }),
            },
            {
                tag: 'div',
                class: 'd-flex align-items-center mx-auto',
                children: [
                    {
                        tag: 'i',
                        class: 'fas fa-filter px-2',
                    },
                    {
                        tag: 'i',
                        innerText: 'All',
                        class: class$('All'),
                        onclick: () => {
                            filterMode$.next('All')
                        },
                    },
                    {
                        tag: 'i',
                        innerText: 'Active',
                        class: class$('Active'),
                        onclick: () => {
                            filterMode$.next('Active')
                        },
                    },
                    {
                        tag: 'i',
                        innerText: 'Completed',
                        class: class$('Completed'),
                        onclick: () => {
                            filterMode$.next('Completed')
                        },
                    },
                ],
            },
        ]
    }
}

export class HelpView implements VirtualDOM<'div'> {
    public readonly tag = 'div'
    public readonly class = 'my-3'
    public readonly children: ChildrenLike = [
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
    ]
}

export class AppView implements VirtualDOM<'div'> {
    static readonly ClassName = 'app-view'
    public readonly tag = 'div'
    public readonly class = `${AppView.ClassName} p-3 d-flex flex-column mx-auto`
    public readonly style = {
        maxWidth: '500px',
    }

    public readonly children: ChildrenLike
    public readonly filterMode$ = new BehaviorSubject<FilterMode>('All')
    public readonly state: State

    constructor(params: { state: State }) {
        Object.assign(this, params)
        this.children = [
            new TitleView(),
            new NewItemView(this.state),
            new ItemsView(this.state, this.filterMode$),
            new FooterView(this.state, this.filterMode$),
            new HelpView(),
        ]
    }
}
