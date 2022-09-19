import {nodeResolve} from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs"

export default {
    input: "src/index.ts",
    output: {
        file: "dist/index.bundle.js",
        format: "iife"
    },
    plugins: [
        nodeResolve(),
        livereload(),
        serve(),
        commonjs(),
        typescript({
            allowSyntheticDefaultImports: true,
            target: "ES2022"
        }),
    ]
}
