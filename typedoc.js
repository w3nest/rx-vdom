/* eslint-env node -- eslint-comment add exception because the running context is node environment */
module.exports = {
    entryPoints: ['./src/index.ts'],
    readme: './assets/indexAPIdoc.md',
    exclude: ['src/tests'],
    out: 'dist/docs',
    theme: 'default',
    categorizeByGroup: false,
    plugin: ['typedoc-plugin-mdn-links'],
}
