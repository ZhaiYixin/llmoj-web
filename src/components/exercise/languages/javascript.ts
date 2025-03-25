export const javascriptTemplate = `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (input) => {
  if (input === '') {
    return rl.close();
  }
  const [a, b] = input.split(' ').map(Number)
  console.log(a + b);
});`

export const javascriptKeywords = [
  'function',
  'return',
  'if',
  'else',
  'while',
  'for',
  'let',
  'const',
  'var',
  'class',
  'extends',
  'constructor',
  'super',
  'import',
  'export',
  'default',
  'try',
  'catch',
  'finally',
  'throw',
  'new',
  'this',
  'typeof',
  'instanceof',
  'in',
  'of',
  'break',
  'continue',
  'switch',
  'case',
  'default',
  'async',
  'await',
  'console.log',
  'document.querySelector',
  'JSON.stringify',
  'Math.random',
  'Math.floor',
  'Math.ceil',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'fetch',
  'Promise',
]
