import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const plugins = [
	json(),
	resolve(),
	commonjs(),
	babel({
		exclude: 'node_modules/**', // only transpile our source code
		presets: [
			"@babel/preset-env"
		],
		plugins: [
			"@babel/plugin-transform-class-properties"
		]
	}),
	terser({
		keep_fnames: true
	})
];

export default [
	{
		input: './src/ul4.js',
		output: [
			{
				file: './dist/umd/ul4.js',
				format: 'umd',
				name: 'ul4',
				sourcemap: true
			},
			{
				file: './dist/esm/ul4.js',
				format: 'esm',
				name: 'ul4',
				sourcemap: true
			}
		],
		plugins: plugins
	}
];