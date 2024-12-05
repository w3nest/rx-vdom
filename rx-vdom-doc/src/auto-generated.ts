/* eslint-disable */
const runTimeDependencies = {
    "externals": {
        "@w3nest/webpm-client": "^0.1.2",
        "mkdocs-ts": "^0.2.0",
        "rx-vdom": "^0.1.2",
        "rxjs": "^7.5.6"
    },
    "includedInBundle": {}
}
const externals = {
    "@w3nest/webpm-client": "window['@w3nest/webpm-client_APIv01']",
    "mkdocs-ts": "window['mkdocs-ts_APIv02']",
    "rx-vdom": "window['rx-vdom_APIv01']",
    "rxjs": "window['rxjs_APIv7']"
}
const exportedSymbols = {
    "@w3nest/webpm-client": {
        "apiKey": "01",
        "exportedSymbol": "@w3nest/webpm-client"
    },
    "mkdocs-ts": {
        "apiKey": "02",
        "exportedSymbol": "mkdocs-ts"
    },
    "rx-vdom": {
        "apiKey": "01",
        "exportedSymbol": "rx-vdom"
    },
    "rxjs": {
        "apiKey": "7",
        "exportedSymbol": "rxjs"
    }
}

const mainEntry : {entryFile: string,loadDependencies:string[]} = {
    "entryFile": "./main.ts",
    "loadDependencies": [
        "mkdocs-ts",
        "rx-vdom",
        "@w3nest/webpm-client",
        "rxjs"
    ]
}

const secondaryEntries : {[k:string]:{entryFile: string, name: string, loadDependencies:string[]}}= {}

const entries = {
     'rx-vdom-doc': './main.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`rx-vdom-doc/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'rx-vdom-doc',
        assetId:'cngtdmRvbS1kb2M=',
    version:'0.1.2-wip',
    shortDescription:"Documentation app for the library rx-vdom",
    developerDocumentation:'https://platform.youwol.com/apps/@youwol/cdn-explorer/latest?package=rx-vdom-doc&tab=doc',
    npmPackage:'https://www.npmjs.com/package/rx-vdom-doc',
    sourceGithub:'https://github.com/rx-vdom-doc',
    userGuide:'',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    secondaryEntries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{
        cdnClient:{install:(_:unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`rx-vdom-doc_APIv01`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{
        name: string,
        cdnClient:{install:(_:unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const entry = secondaryEntries[name]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `rx-vdom-doc#0.1.2-wip~dist/rx-vdom-doc/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`rx-vdom-doc/${entry.name}_APIv01`]
        })
    },
    getCdnDependencies(name?: string){
        if(name && !secondaryEntries[name]){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const deps = name ? secondaryEntries[name].loadDependencies : mainEntry.loadDependencies

        return deps.map( d => `${d}#${runTimeDependencies.externals[d]}`)
    }
}
