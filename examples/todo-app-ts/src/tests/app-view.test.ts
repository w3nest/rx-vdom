/* eslint  @typescript-eslint/no-non-null-assertion: 0 */

import { State, AppView, FooterView, ItemView, Item } from '../app'
import { extractActualProperties } from './common'
import { render } from 'rx-vdom'

function enterName(editionView: HTMLInputElement, name: string) {
    editionView.dispatchEvent(new Event('click', { bubbles: true }))
    for (const char of name) {
        editionView.dispatchEvent(new KeyboardEvent('keydown', { key: char }))
    }
    editionView.value = name
    editionView.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
}

function initializeStateAndView(items: Item[]) {
    localStorage.setItem(State.STORAGE_KEY, JSON.stringify(items))
    const state = new State()
    const appView = new AppView({ state })
    const div = render(appView)
    document.body.appendChild(div)
    return { state, appView }
}

beforeEach(() => {
    document.body.textContent = ''
})

test('on-load does insert the view in the DOM', async () => {
    await import('../app/on-load')
    const appView = document.querySelector(`.${AppView.ClassName}`)
    expect(appView).toBeTruthy()
})

function getItemsView(): NodeListOf<ItemView & HTMLElement> {
    return document.querySelectorAll(`.${ItemView.ClassName}`)
}

describe('AppView', () => {
    beforeEach(() => {
        document.body.innerHTML = '' // Clear DOM
    })

    test('displays the root view', () => {
        const { appView } = initializeStateAndView([
            { id: 0, name: 'foo', done: false },
            { id: 1, name: 'bar', done: true },
        ])
        expect(appView).toBeTruthy()
        expect(appView.filterMode$.value).toBe('All')
    })

    test('renders items correctly', () => {
        initializeStateAndView([
            { id: 0, name: 'foo', done: false },
            { id: 1, name: 'bar', done: true },
        ])

        const itemsView = getItemsView()
        expect([...itemsView]).toHaveLength(2)
        expect(itemsView[0].item).toEqual({ id: 0, name: 'foo', done: false })
    })

    test('toggles item state using state', () => {
        const { state } = initializeStateAndView([
            { id: 0, name: 'foo', done: false },
            { id: 1, name: 'bar', done: true },
        ])

        state.toggleItem(0)
        const itemsView = getItemsView()
        expect([...itemsView]).toHaveLength(2)
        expect(itemsView[0].item.done).toBeTruthy()
    })

    test('renames an item', async () => {
        const { state } = initializeStateAndView([
            { id: 0, name: 'foo', done: false },
            { id: 1, name: 'bar', done: true },
        ])

        const itemsView = getItemsView()
        const item = itemsView[0]
        const innerItemView = item.querySelector('.presentation-view')!
        innerItemView.dispatchEvent(new Event('dblclick', { bubbles: true }))

        enterName(item.querySelector('.edition-view')!, 'new-name')
        const updatedState = await extractActualProperties(state)
        expect(updatedState.items[0].name).toBe('new-name')
    })

    test('deletes an item', () => {
        initializeStateAndView([
            { id: 0, name: 'foo', done: false },
            { id: 1, name: 'bar', done: true },
        ])

        const itemsView = getItemsView()
        const deleteButton = itemsView[0].querySelector('.item-view-remove')!
        deleteButton.dispatchEvent(new Event('click', { bubbles: true }))

        const updatedItemsView = getItemsView()
        expect([...updatedItemsView]).toHaveLength(1)
    })

    test('creates a new item', async () => {
        const { state } = initializeStateAndView([])
        const newItemView = document.querySelector(`.new-item-input`)!

        expect(newItemView).toBeTruthy()
        enterName(newItemView as HTMLInputElement, 'new-item')

        const updatedState = await extractActualProperties(state)
        expect(updatedState.items).toHaveLength(1)
        expect(updatedState.items[0].name).toBe('new-item')
    })

    test('filters items using the footer view', () => {
        initializeStateAndView([
            { id: 0, name: 'foo', done: false },
            { id: 1, name: 'bar', done: true },
        ])

        const footerView = document.querySelector(`.${FooterView.ClassName}`)!
        expect(footerView).toBeTruthy()

        const completedToggle = document.querySelector('.Completed')!
        completedToggle.dispatchEvent(new Event('click', { bubbles: true }))

        const itemsView = getItemsView()
        expect([...itemsView]).toHaveLength(1)

        const activeToggle = document.querySelector('.Active')!
        activeToggle.dispatchEvent(new Event('click', { bubbles: true }))
        const activeItemsView = getItemsView()
        expect([...activeItemsView]).toHaveLength(1)

        const allToggle = document.querySelector('.All')!
        allToggle.dispatchEvent(new Event('click', { bubbles: true }))
        const toggledItemsView = getItemsView()
        expect([...toggledItemsView]).toHaveLength(2)
    })

    test('toggles all items', () => {
        initializeStateAndView([
            { id: 0, name: 'foo', done: false },
            { id: 1, name: 'bar', done: false },
        ])

        const toggleAll = document.querySelector('.new-item-view-toggle-all')!
        toggleAll.dispatchEvent(new Event('click', { bubbles: true }))

        const activeToggle = document.querySelector('.Active')!
        activeToggle.dispatchEvent(new Event('click', { bubbles: true }))

        const itemsView = getItemsView()
        expect([...itemsView]).toHaveLength(0)
    })
})
