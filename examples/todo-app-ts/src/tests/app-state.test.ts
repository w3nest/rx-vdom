import { State, Item } from '../app'
import { firstValueFrom, of } from 'rxjs'
import { extractActualProperties, makeAction } from './common'

test('scenario add & toggle items', async () => {
    /**
     * The state exposes only observables, it requires to retrieve the actual values of properties at some points.     *
     * An 'extractProperties' promise is used, it serves as 'synchronization point'.
     */

    localStorage.setItem(
        State.STORAGE_KEY,
        JSON.stringify([{ id: 0, name: 'foo' }]),
    )

    const state = new State()
    const s0 = await extractActualProperties(state)

    expect(s0.items).toHaveLength(1)
    expect(s0.completed).toBeFalsy()
    expect(s0.remaining).toHaveLength(1)

    const item = state.addItem('bar')
    const s1 = await extractActualProperties(state)

    expect(s1.items).toHaveLength(2)
    expect(s1.completed).toBeFalsy()
    expect(s1.remaining).toHaveLength(2)

    state.toggleItem(item.id)
    const s2 = await extractActualProperties(state)

    expect(s2.completed).toBeFalsy()
    expect(s2.remaining).toHaveLength(1)

    state.toggleItem(0)
    const s3 = await extractActualProperties(state)

    expect(s3.completed).toBeTruthy()
    expect(s3.remaining).toHaveLength(0)

    state.toggleAll()
    const s4 = await extractActualProperties(state)
    expect(s4.completed).toBeFalsy()
    expect(s4.remaining).toHaveLength(2)
})

test('scenario rename & delete items', async () => {
    /**
     * This test illustrates how to use a rxjs pipeline to describe the multiple steps of a scenario.
     */
    localStorage.setItem(
        State.STORAGE_KEY,
        JSON.stringify([{ id: 0, name: 'foo' }]),
    )
    /**
     * This class is used to store data while the test proceed.
     */
    class TestContext {
        state: State
        item?: Item
        constructor(params: { state: State; item?: Item }) {
            Object.assign(this, params)
        }
    }
    const state = new State()

    const test$ = of(new TestContext({ state })).pipe(
        makeAction({
            action: (context) => {
                const item = state.addItem('bar')
                return new TestContext({ ...context, item })
            },
            expect: ({ items, completed, remaining }) => {
                expect(items).toHaveLength(2)
                expect(completed).toBeFalsy()
                expect(remaining).toHaveLength(2)
            },
        }),
        makeAction({
            action: (context) => {
                if (context.item) {
                    state.deleteItem(context.item.id)
                }
                return context
            },
            expect: ({ items, completed, remaining }) => {
                expect(items).toHaveLength(1)
                expect(completed).toBeFalsy()
                expect(remaining).toHaveLength(1)
            },
        }),
        makeAction({
            action: (context) => {
                state.setName(0, 'foo-renamed')
                return context
            },
            expect: ({ items }) => {
                expect(items).toHaveLength(1)
                expect(items[0].name).toBe('foo-renamed')
            },
        }),
        makeAction({
            action: (context) => {
                state.deleteItem(0)
                return context
            },
            expect: ({ items, completed, remaining }) => {
                expect(items).toHaveLength(0)
                expect(completed).toBeTruthy()
                expect(remaining).toHaveLength(0)
            },
        }),
    )
    await firstValueFrom(test$)
})
