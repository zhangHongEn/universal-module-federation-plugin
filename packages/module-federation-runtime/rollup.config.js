import babel from "rollup-plugin-babel"
import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import { terser } from "rollup-plugin-terser"
import serve from "rollup-plugin-serve"

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "es",
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
    terser(),
  ],
};
