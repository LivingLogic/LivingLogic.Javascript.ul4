import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

const plugins = [
	sourcemaps(),
	json(),
	resolve(),
	commonjs(),
	babel({
		exclude: 'node_modules/**', // only transpile our source code
		presets: [
			"@babel/preset-env"
		]
	}),
	terser({
		keep_fnames: true
	})
];

export default [
	{
		input: './src/ul4.mjs',
		output: [
			{
				file: './dist/ul4.js',
				format: 'umd',
				name: 'ul4',
				sourcemap: true
			},
			{
				file: './dist/es2015/ul4.js',
				format: 'esm',
				name: 'ul4',
				sourcemap: true
			}
		],
		plugins: plugins
	}
];