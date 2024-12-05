import { generateApiFiles } from '../../../mkdocs-ts/src/backends/ts-typedoc'

generateApiFiles({
    projectFolder: '/home/greinisch/Projects/w3nest/esm/rx-vdom/',
    outputFolder: '../assets/api',
    baseNav: '/api',
})
