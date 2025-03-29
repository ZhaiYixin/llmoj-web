export const cppTemplate = `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`

export const cppKeywords = [
  'int',
  'float',
  'if',
  'else',
  'while',
  'for',
  'return',
  'void',
  'class',
  'public',
  'private',
  'protected',
  'namespace',
  'using',
  'new',
  'delete',
  'this',
  'try',
  'catch',
  'throw',
  'std::vector',
  'std::map',
  'std::string',
  'std::cout',
  'std::cin',
  'std::endl',
  'std::sort',
  'std::find',
  'std::unique',
  'std::accumulate',
  'std::pair',
  'std::make_pair',
  'std::set',
]
