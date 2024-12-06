import { BehaviorSubject, Observable, map } from 'rxjs'

export interface Item {
    id: number
    name: string
    done: boolean
}

export class State {
    static readonly STORAGE_KEY = '@rx-vdom/todo-app-ts'

    public readonly items$: Observable<Item[]>
    public readonly completed$: Observable<boolean>
    public readonly remaining$: Observable<Item[]>

    private readonly __items$ = new BehaviorSubject<Item[]>([])

    constructor() {
        this.items$ = this.__items$.asObservable()

        this.__items$.next(
            JSON.parse(
                localStorage.getItem(State.STORAGE_KEY) ?? '[]',
            ) as Item[],
        )
        this.items$.subscribe((items) => {
            localStorage.setItem(State.STORAGE_KEY, JSON.stringify(items))
        })
        this.completed$ = this.items$.pipe(
            map((items) => items.reduce((acc, item) => acc && item.done, true)),
        )
        this.remaining$ = this.items$.pipe(
            map((items) => items.filter((item) => !item.done)),
        )
    }

    toggleAll() {
        const completed = this.getItems().reduce(
            (acc, item) => acc && item.done,
            true,
        )
        this.__items$.next(
            this.getItems().map((item) => ({
                id: item.id,
                name: item.name,
                done: !completed,
            })),
        )
    }

    addItem(name: string) {
        const item = { id: Date.now(), name, done: false }
        this.__items$.next([...this.getItems(), item])
        return item
    }

    deleteItem(id: number) {
        this.__items$.next(this.getItems().filter((item) => item.id !== id))
    }

    toggleItem(id: number) {
        const items = this.getItems().map((item) =>
            item.id === id
                ? { id: item.id, name: item.name, done: !item.done }
                : item,
        )
        this.__items$.next(items)
    }

    setName(id: number, name: string) {
        const items = this.getItems().map((item) =>
            item.id === id ? { id: item.id, name, done: item.done } : item,
        )
        this.__items$.next(items)
    }

    private getItems() {
        return this.__items$.value
    }
}
