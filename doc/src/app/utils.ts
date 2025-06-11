import * as webpmClient from '@w3nest/webpm-client'
import pkgJson from '../../package.json'
import type * as NotebookModule from '@mkdocs-ts/notebook'
import type * as CodeApiModule from '@mkdocs-ts/code-api'

export async function installNotebookModule() {
    const notebookVersion = pkgJson.webpm.dependencies['@mkdocs-ts/notebook']
    const { Notebook } = await webpmClient.install<{
        Notebook: typeof NotebookModule
    }>({
        esm: [`@mkdocs-ts/notebook#${notebookVersion} as Notebook`],
        css: [`@mkdocs-ts/notebook#${notebookVersion}~assets/notebook.css`],
    })
    return Notebook
}

export async function installCodeApiModule() {
    const codeApiVersion = pkgJson.webpm.dependencies['@mkdocs-ts/code-api']
    const { CodeApi } = await webpmClient.install<{
        CodeApi: typeof CodeApiModule
    }>({
        esm: [`@mkdocs-ts/code-api#${codeApiVersion} as CodeApi`],
        css: [`@mkdocs-ts/code-api#${codeApiVersion}~assets/ts-typedoc.css`],
    })
    return CodeApi
}
