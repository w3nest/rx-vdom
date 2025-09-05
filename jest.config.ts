import { Config } from 'jest'
import type { Config as JestConfig } from '@jest/types'

const reporters: JestConfig.ReporterConfig[] = [
    ['default', {}], // keep default console output
    [
        'jest-junit',
        {
            outputDirectory: 'tooling/jest',
        },
    ],
]

const jestConfig: Config = {
    transform: { '^.+\\.tsx?$': ['ts-jest', {}] },
    testRunner: 'jest-circus',
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['<rootDir>/.w3nest', '<rootDir>/dist'],
    coverageDirectory: 'tooling/jest',
    reporters,
    testPathIgnorePatterns: ['rx-vdom-doc', 'examples'],
    //testEnvironmentOptions: { url: `${url_scheme}://${url_host}:${url_port}` },
}
export default jestConfig
