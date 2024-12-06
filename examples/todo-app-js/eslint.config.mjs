import eslint from '@eslint/js'
import eslintPluginPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
    eslint.configs.recommended,
    eslintPluginPrettier,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
]
