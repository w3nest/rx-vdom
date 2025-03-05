import { generateApiFiles } from './../node_modules/mkdocs-ts/src/mkapi-backends/mkapi-typescript'

generateApiFiles({
    projectFolder: `${__dirname}/../../`,
    outputFolder: `${__dirname}/../assets/api`,
    baseNav: '/api',
})
