import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import esbuild from 'rollup-plugin-esbuild'

export default {
  input: 'index.html',
  output: {dir: 'dist'},
  plugins: [esbuild({target: 'es2022'}), html({input: 'index.html'})]
}
