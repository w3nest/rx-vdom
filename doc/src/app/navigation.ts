import { Navigation, DefaultLayout, segment } from 'mkdocs-ts'
import { logo } from './logo'
import { companionNodes$ } from './on-load'
import { fromMd } from './config.markdown'
import { notebookPage } from './config.notebook'
import { installCodeApiModule } from './utils'

function decoration(icon: string) {
    return {
        icon: {
            tag: 'i' as const,
            class: `fas ${icon}`,
        },
    }
}

type AppNav = Navigation<DefaultLayout.NavLayout, DefaultLayout.NavHeader>

export const navigation: AppNav = {
    name: 'Rx-vDOM',
    layout: {
        content: fromMd('index.md'),
    },
    header: {
        icon: logo,
        wrapperClass: `${DefaultLayout.NavHeaderView.DefaultWrapperClass} border-bottom p-1`,
    },
    routes: {
        '/how-to': {
            name: 'How to',
            header: decoration('fa-question-circle'),
            layout: {
                content: fromMd('how-to.md'),
            },
        },
        '/tutorials': tutorialsNav(),
        '/api': apiNav(),
    },
}

function tutorialsNav(): AppNav {
    return {
        name: 'Tutorials',
        header: decoration('fa-graduation-cap'),
        layout: {
            content: fromMd('tutorials.md'),
        },
        routes: {
            [segment('/basics')]: {
                name: 'Getting started',
                layout: {
                    content: ({ router }) =>
                        notebookPage('tutorials.basics.md', router),
                },
            },
            [segment('/todo')]: {
                name: 'ToDo app.',
                layout: {
                    content: ({ router }) =>
                        notebookPage('tutorials.todo.md', router),
                },
            },
        },
    }
}
async function apiNav(): Promise<AppNav> {
    const CodeApiModule = await installCodeApiModule()

    return {
        ...CodeApiModule.codeApiEntryNode({
            name: 'API',
            header: {
                icon: {
                    tag: 'i' as const,
                    class: `fas fa-code`,
                },
                actions: [
                    DefaultLayout.splitCompanionAction({
                        path: '/api',
                        companionNodes$,
                    }),
                ],
            },
            entryModule: 'rx-vdom',
            dataFolder: '../assets/api',
            rootModulesNav: {
                'rx-vdom': '@nav/api',
            },
            configuration: CodeApiModule.configurationTsTypedoc,
        }),
        // Explicitly set no children.
        routes: undefined,
    }
}
