import {
    fromMarkdown,
    installCodeApiModule,
    installNotebookModule,
    Navigation,
    GlobalMarkdownViews,
    DefaultLayout,
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

export const navigation: Navigation = {
    name: 'Rx-vDOM',
    layout: {
        kind: 'default',
        content: fromMd('index.md'),
    },
    decoration: {
        icon: logo,
        wrapperClass: `${DefaultLayout.NavigationNodeHeader.DefaultWrapperClass} border-bottom p-1`,
    },
    '/how-to': {
        name: 'How to',
        decoration: decoration('fa-question-circle'),
        layout: {
            kind: 'default',
            content: fromMd('how-to.md'),
        },
        '/install': {
            name: 'Install',
            layout: {
                kind: 'default',
                content: fromMd('how-to.install.md'),
            },
        },
        '/typings': {
            name: 'Typings',
            layout: {
                kind: 'default',
                content: fromMd('how-to.typings.md'),
            },
        },
    },
    '/tutorials': tutorialsNav(),
    '/api': apiNav(),
}

async function tutorialsNav(): Promise<Navigation> {
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
        decoration: decoration('fa-graduation-cap'),
        layout: {
            kind: 'default',
            content: ({ router }) =>
                new NotebookModule.NotebookPage({
                    url: url('tutorials.md'),
                    router,
                    options: notebookOptions,
                }),
        },
        '/basics': {
            name: 'Getting started',
            layout: {
                kind: 'default',
                content: ({ router }) =>
                    new NotebookModule.NotebookPage({
                        url: url('tutorials.basics.md'),
                        router,
                        options: notebookOptions,
                    }),
            },
        },
        '/todo': {
            name: 'ToDo app.',
            layout: {
                kind: 'default',
                content: ({ router }) =>
                    new NotebookModule.NotebookPage({
                        url: url('tutorials.todo.md'),
                        router,
                        options: notebookOptions,
                    }),
            },
        },
    }
}
async function apiNav(): Promise<Navigation> {
    const CodeApiModule = await installCodeApiModule()

    return {
        ...CodeApiModule.codeApiEntryNode({
            name: 'API',
            layoutKind: 'default',
            icon: {
                tag: 'i' as const,
                class: `fas fa-code`,
            },
            entryModule: 'rx-vdom',
            docBasePath: '../assets/api',
            configuration: CodeApiModule.configurationTsTypedoc,
        }),
        // Explicitly set no children (no sub-modules).
        '...': undefined,
    }
}
