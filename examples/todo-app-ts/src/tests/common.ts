import { State, Item } from '../app'
import { combineLatest, Observable, map, mergeMap, take, tap } from 'rxjs'

export async function extractActualProperties(state: State) {
    return new Promise<{
        items: Item[]
        completed: boolean
        remaining: Item[]
    }>((resolve) => {
        return combineLatest([state.items$, state.completed$, state.remaining$])
            .pipe(take(1))
            .subscribe(([items, completed, remaining]) => {
                resolve({ items, completed, remaining })
            })
    })
}

export function makeAction<TContext extends { state: State }>({
    action,
    expect,
}: {
    action: (ctx: TContext) => TContext
    expect: (p: {
        items: Item[]
        completed: boolean
        remaining: Item[]
    }) => void
}) {
    return (obs: Observable<TContext>): Observable<TContext> => {
        return obs.pipe(
            map((context) => {
                return action(context)
            }),
            mergeMap((context: TContext) => {
                return combineLatest([
                    context.state.items$,
                    context.state.completed$,
                    context.state.remaining$,
                ]).pipe(
                    take(1),
                    tap(([items, completed, remaining]) => {
                        expect({ items, completed, remaining })
                    }),
                    map(() => context),
                )
            }),
        )
    }
}
