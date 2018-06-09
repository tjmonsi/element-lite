import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser as uglify } from 'rollup-plugin-terser';
import fs from 'fs';
const output = [];

const ignoreFiles = [
  '.eslintrc.js',
  'rollup.config.js'
];

const files = fs.readdirSync(__dirname).filter(file => {
  const fileArray = file.split('.');
  return fileArray[fileArray.length - 1] === 'js' && ignoreFiles.indexOf(file) < 0;
}).map(file => file.replace(/\.js$/g, ''));

const testScriptFiles = fs.readdirSync('test/unit/scripts');
const testCaseFiles = fs.readdirSync('test/unit/cases');

const outputUMDPush = (input, file, name, es5, minify) => {
  const plugins = [
    resolve(), // so Rollup can find `ms`
    commonjs() // so Rollup can convert `ms` to an ES module
  ];
  if (es5) {
    plugins.push(babel());
  }
  if (minify) {
    plugins.push(uglify());
  }
  output.push({
    input,
    plugins,
    output: {
      file,
      name,
      format: 'umd'
    }
  });
};

const outputCJSESPush = (input, name, es5) => {
  const plugins = [];
  if (es5) {
    plugins.push(babel());
  }
  output.push({
    input,
    plugins,
    external: ['ms'],
    output: [
      { file: `dist/${name}.cjs.es5.js`, format: 'cjs' },
      { file: `dist/${name}.esm.es5.js`, format: 'es' }
    ]
  });
};

outputUMDPush('lib/es6-symbol.js', 'polyfills/es6-symbol.js', 'NativeShim', true);
outputUMDPush('lib/native-shim.js', 'polyfills/native-shim.js', 'NativeShim', true);

for (let testFile of testCaseFiles) {
  outputUMDPush(`test/unit/cases/${testFile}`, `test/unit/cases-es5/${testFile}`, 'TestElements', true);
}

for (let testFile of testScriptFiles) {
  outputUMDPush(`test/unit/scripts/${testFile}`, `test/unit/scripts-es5/${testFile}`, 'TestElements', true);
}

for (let name of files) {
  let input = `${name}.js`;
  outputUMDPush(input, `dist/${name}.umd.js`, 'ElementLite');
  outputUMDPush(input, `dist/${name}.umd.min.js`, 'ElementLite', false, true);
  outputUMDPush(input, `dist/${name}.umd.es5.js`, 'ElementLite', true);
  outputUMDPush(input, `dist/${name}.umd.es5.min.js`, 'ElementLite', true, true);
  outputCJSESPush(input, name);
  outputCJSESPush(input, name, true);
}

export default output;
