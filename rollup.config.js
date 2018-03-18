import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
const output = [];

const files = [
  'element-lite',
  'element-lite-lit-only',
  'element-lite-base',
  'element-lite-static-shadow'
];

const testFiles = [
  'element-lite-base',
  'element-lite-lit-only',
  'element-lite'
];

for (let testFile of testFiles) {
  output.push({
    input: `test/unit/scripts/${testFile}.test.js`,
    output: {
      file: `test/unit/scripts/${testFile}.browser.es5.test.js`,
      format: 'umd',
      name: 'TestElements'
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      buble({ // transpile ES2015+ to ES5
        exclude: ['node_modules/**'],
        transforms: {
          templateString: false,
          forOf: false
        }
      })
    ]
  });
}

for (let name of files) {
  let input = `${name}.js`;
  output.push({
    input,
    output: {
      file: `dist/${name}.umd.js`,
      format: 'umd',
      name: 'ElementLite'
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs() // so Rollup can convert `ms` to an ES module
    ]
  });

  output.push({
    input,
    output: {
      file: `dist/${name}.umd.min.js`,
      format: 'umd',
      name: 'ElementLite'
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      uglify()
    ]
  });

  output.push({
    input,
    output: {
      file: `dist/${name}.umd.es5.js`,
      format: 'umd',
      name: 'ElementLite'
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      buble({ // transpile ES2015+ to ES5
        exclude: ['node_modules/**'],
        transforms: {
          templateString: false,
          forOf: false
        }
      })
    ]
  });

  output.push({
    input,
    output: {
      file: `dist/${name}.umd.es5.min.js`,
      format: 'umd',
      name: 'ElementLite'
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      buble({ // transpile ES2015+ to ES5
        exclude: ['node_modules/**'],
        transforms: {
          templateString: false,
          forOf: false
        }
      }),
      uglify()
    ]
  });

  output.push({
    input,
    external: ['ms'],
    output: [
      { file: `dist/${name}.cjs.js`, format: 'cjs' },
      { file: `dist/${name}.esm.js`, format: 'es' }
    ]
  });

  output.push({
    input,
    external: ['ms'],
    output: [
      { file: `dist/${name}.cjs.es5.js`, format: 'cjs' },
      { file: `dist/${name}.esm.es5.js`, format: 'es' }
    ],
    plugins: [
      buble({ // transpile ES2015+ to ES5
        exclude: ['node_modules/**'],
        transforms: {
          templateString: false,
          forOf: false
        }
      })
    ]
  });
}

export default output;
