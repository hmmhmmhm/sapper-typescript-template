// * Rollup Modules
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import svelte from 'rollup-plugin-svelte'
import babel from 'rollup-plugin-babel'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

// * Configs
import config from 'sapper/config/rollup.js'
import pkg from './package.json'

// * Specity the Build Options
const mode = process.env.NODE_ENV
const dev = mode === 'development'
const legacy = !!process.env.SAPPER_LEGACY_BUILD
const sourcemap = dev ? 'inline' : false

// * Ignore of the sapper dependency warning
const onwarn = (warning, onwarn) =>
    (warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) || onwarn(warning)

// * Specify the Build Paths
const src = `${process.cwd()}/src`
let dest = `${process.cwd()}/__sapper__/dev`
if (!dev) dest = `${process.cwd()}/__sapper__/build`

// * Override Default Configs
config.client = {
    input: () => {
        return `${src}/client.ts`
    },

    output: () => {
        let dir = `${dest}/client`
        if (process.env.SAPPER_LEGACY_BUILD) dir += `/legacy`

        return {
            dir,
            entryFileNames: '[name].[hash].js',
            chunkFileNames: '[name].[hash].js',
            format: 'esm',
            sourcemap
        }
    },
}
config.server = {
    input: () => {
        return {
            server: `${src}/server.ts`
        };
    },
    output: () => {
        return {
            dir: `${dest}/server`,
            format: 'cjs',
            sourcemap
        }
    },
}
config.serviceworker = {
    input: () => {
        return `${src}/service-worker.ts`
    },

    output: () => {
        return {
            file: `${dest}/service-worker.js`,
            format: 'iife',
            sourcemap
        }
    },
}

// * Export the Rollup Config
export default {
    client: {
        input: config.client.input(),
        output: config.client.output(),
        plugins: [
            replace({
                'process.browser': true,
                'process.env.NODE_ENV': JSON.stringify(mode),
            }),
            svelte({
                dev,
                hydratable: true,
                emitCss: true,
                preprocess: require('./svelte.config').preprocess,
            }),
            resolve({
                browser: true,
            }),
            commonjs(),
            typescript({
                typescript: require('typescript'),
                cacheRoot: `${require('temp-dir')}/.rpt2_cache`,
            }),

            legacy &&
            babel({
                extensions: ['.js', '.mjs', '.html', '.svelte'],
                runtimeHelpers: true,
                exclude: ['node_modules/@babel/**'],
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: 'cover 99.5%',
                        },
                    ],
                ],
                plugins: [
                    '@babel/plugin-syntax-dynamic-import',
                    [
                        '@babel/plugin-transform-runtime',
                        {
                            useESModules: true,
                        },
                    ],
                ],
            }),

            !dev &&
            terser({
                module: true,
            }),
        ],

        preserveEntrySignatures: false,
        onwarn,
    },

    server: {
        input: config.server.input(),
        output: config.server.output(),
        plugins: [
            replace({
                'process.browser': false,
                'process.env.NODE_ENV': JSON.stringify(mode),
            }),
            svelte({
                generate: 'ssr',
                dev,
                preprocess: require('./svelte.config').preprocess,
            }),
            resolve(),
            commonjs(),
            typescript({
                typescript: require('typescript'),
                cacheRoot: `${require('temp-dir')}/.rpt2_cache`,
            }),
        ],
        external: Object.keys(pkg.dependencies).concat(
            require('module').builtinModules || Object.keys(process.binding('natives')),
        ),

        preserveEntrySignatures: 'strict',
        onwarn,
    },

    serviceworker: {
        input: config.serviceworker.input(),
        output: config.serviceworker.output(),
        plugins: [
            resolve(),
            replace({
                'process.browser': true,
                'process.env.NODE_ENV': JSON.stringify(mode),
            }),
            commonjs(),
            typescript({
                typescript: require('typescript'),
                cacheRoot: `${require('temp-dir')}/.rpt2_cache`,
            }),
            !dev && terser(),
        ],

        preserveEntrySignatures: false,
        onwarn,
    },
}
