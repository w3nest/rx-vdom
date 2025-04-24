import { installNotebookModule, Router } from 'mkdocs-ts'
import { createRootContext } from './config.context'
import { placeholders, url } from './config.markdown'
import { firstValueFrom } from 'rxjs'

import * as webpmClient from '@w3nest/webpm-client'
import pkgJson from '../../package.json'

export const notebookOptions = {
    runAtStart: true,
    defaultCellAttributes: {
        lineNumbers: false,
    },
    markdown: {
        latex: false,
        placeholders,
    },
}

export const notebookPage = async (target: string, router: Router) => {
    const [NotebookModule] = await Promise.all([
        installNotebookModule(),
        webpmClient.install({
            css: [
                `mkdocs-ts#${pkgJson.webpm.dependencies['mkdocs-ts']}~assets/notebook.css`,
            ],
        }),
    ])

    await firstValueFrom(
        NotebookModule.SnippetEditorView.fetchCmDependencies$('javascript'),
    )
    const context = createRootContext({
        threadName: `Notebook(${target})`,
        labels: ['Notebook'],
    })
    return new NotebookModule.NotebookPage(
        {
            url: url(target),
            router,
            options: notebookOptions,
        },
        context,
    )
}
