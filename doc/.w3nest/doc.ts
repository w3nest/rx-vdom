import { generateApiFiles } from 'mkdocs-ts/src/backends/ts-typedoc'

generateApiFiles({
    projectFolder: `${__dirname}/../../`,
    outputFolder: `${__dirname}/../assets/api`,
    baseNav: '/api',
})
