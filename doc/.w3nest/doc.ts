import { generateApiFiles } from './../node_modules/@mkdocs-ts/code-api/src/mkapi-backends/mkapi-typescript'

generateApiFiles({
    projectFolder: `${__dirname}/../../`,
    outputFolder: `${__dirname}/../assets/api`,
})
