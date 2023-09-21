import babel from "rollup-plugin-babel"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import { terser } from "rollup-plugin-terser"
import serve from "rollup-plugin-serve"
import replace from '@rollup/plugin-replace';


export default {
  input: "src/index.js",
  output: process.env.TARGET === "web" ? [
    {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true,
    }
  ] : [
    {
      file: "dist/node.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins: [
    babel({
      exclude: "node_modules/**",
    }),
    // serve({
    //   open: true,
    //   contentBase: '',
    //   port: 8080,
    //   openPage: '/index.html',
    // }),
    resolve(),
    commonjs(),
    replace({
      'process.env.TARGET': JSON.stringify(process.env.TARGET)
    }),
    terser(),
  ],
};
