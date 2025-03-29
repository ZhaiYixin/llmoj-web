export const cTemplate = `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", a + b);
    return 0;
}`

export const cKeywords = [
  'int',
  'float',
  'if',
  'else',
  'while',
  'for',
  'return',
  'void',
  'char',
  'double',
  'struct',
  'typedef',
  'sizeof',
  'switch',
  'case',
  'break',
  'continue',
  'default',
  'enum',
  'static',
  'const',
  'do',
  'goto',
  'printf',
  'scanf',
  'malloc',
  'free',
  'fopen',
  'fclose',
  'fread',
  'fwrite',
  'fprintf',
  'fscanf',
  'NULL',
  'EXIT_SUCCESS',
  'EXIT_FAILURE',
]
