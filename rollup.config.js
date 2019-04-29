
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'dist/es2015/ul4.js',
    output: {
        format: 'umd',
        dir: 'dist/',
        name: 'ul4',
        sourcemap: true,
        preserveModules: true,
    },
    plugins: [
        sourcemaps()
    ]
}