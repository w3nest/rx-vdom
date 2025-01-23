import {
    fromMarkdown,
    installCodeApiModule,
    installNotebookModule,
    Navigation,
    GlobalMarkdownViews,
    DefaultLayout,
    segment,
} from 'mkdocs-ts'
import { setup } from '../auto-generated'
import { example1 } from './js-plaground-examples'
import { firstValueFrom } from 'rxjs'
import { logo } from './logo'
import { apiLink, exampleHome, rxVDomSize } from './md-widgets'

function decoration(icon: string) {
    return {
        icon: {
            tag: 'i' as const,
            class: `fas ${icon}`,
        },
    }
}

const url = (restOfPath: string) => `../assets/${restOfPath}`

const placeholders = {
    '{{project}}': 'rx-vdom',
    '{{rxvdom-version}}': setup.version,
    '{{URL-example-cdn}}': `/apps/@w3nest/play-js/latest?content=${encodeURIComponent(example1)}`,
    '{{rx-vdom}}': '**`rx-vdom`**',
}
function fromMd(file: string) {
    return fromMarkdown({
        url: url(file),
        placeholders,
    })
}
GlobalMarkdownViews.factory = {
    ...GlobalMarkdownViews.factory,
    'rx-vdom-size': () => rxVDomSize(),
    'example-home': () => exampleHome(),
    'api-link': (elem: HTMLElement) => {
        return apiLink(elem)
    },
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
        [segment('/how-to')]: {
            name: 'How to',
            header: decoration('fa-question-circle'),
            layout: {
                content: fromMd('how-to.md'),
            },
            routes: {
                [segment('/install')]: {
                    name: 'Install',
                    layout: {
                        content: fromMd('how-to.install.md'),
                    },
                },
                [segment('/typings')]: {
                    name: 'Typings',
                    layout: {
                        content: fromMd('how-to.typings.md'),
                    },
                },
            },
        },
        '/tutorials': tutorialsNav(),
        '/api': apiNav(),
    },
}

async function tutorialsNav(): Promise<AppNav> {
    const NotebookModule = await installNotebookModule()
    const notebookOptions = {
        runAtStart: true,
        defaultCellAttributes: {
            lineNumbers: false,
        },
        markdown: {
            latex: true,
            placeholders,
        },
    }
    await firstValueFrom(
        NotebookModule.SnippetEditorView.fetchCmDependencies$('javascript'),
    )
    return {
        name: 'Tutorials',
        header: decoration('fa-graduation-cap'),
        layout: {
            content: ({ router }) =>
                new NotebookModule.NotebookPage({
                    url: url('tutorials.md'),
                    router,
                    options: notebookOptions,
                }),
        },
        routes: {
            [segment('/basics')]: {
                name: 'Getting started',
                layout: {
                    content: ({ router }) =>
                        new NotebookModule.NotebookPage({
                            url: url('tutorials.basics.md'),
                            router,
                            options: notebookOptions,
                        }),
                },
            },
            [segment('/todo')]: {
                name: 'ToDo app.',
                layout: {
                    content: ({ router }) =>
                        new NotebookModule.NotebookPage({
                            url: url('tutorials.todo.md'),
                            router,
                            options: notebookOptions,
                        }),
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
                icon: { tag: 'i' as const, class: `fas fa-code` },
            },
            entryModule: 'rx-vdom',
            docBasePath: '../assets/api',
            configuration: CodeApiModule.configurationTsTypedoc,
        }),
        // Explicitly set no children.
        routes: undefined,
    }
}
