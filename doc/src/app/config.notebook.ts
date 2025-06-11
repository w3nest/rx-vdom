import { Router } from 'mkdocs-ts'
import { createRootContext } from './config.context'
import { placeholders, url } from './config.markdown'
import { installNotebookModule } from './utils'

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
    const NotebookModule = await installNotebookModule()
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
