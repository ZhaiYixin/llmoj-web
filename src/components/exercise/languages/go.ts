export const goTemplate = `package main
import "fmt"

func main() {
    a := 0
    b := 0
    fmt.Scanf("%d %d", &a, &b)
    fmt.Printf("%d", a + b)
}`

export const goKeywords = [
  'func',
  'return',
  'if',
  'else',
  'for',
  'package',
  'import',
  'var',
  'const',
  'struct',
  'type',
  'interface',
  'defer',
  'go',
  'map',
  'range',
  'break',
  'continue',
  'bool',
  'int',
  'float32',
  'float64',
  'string',
  'error',
  'fmt.Println',
  'make',
  'append',
  'len',
  'time.Now',
  'time.Sleep',
  'http.Get',
  'http.Post',
  'json.Marshal',
  'json.Unmarshal',
  'log.Println',
]
