export type TestCase = {
  id: number
  ordinal: number
  title: string
  input: string
  output: string
}

export type TestCaseResult = RunTestCaseResult & {
  id: number
  submission: number
  test_case: number
}

export type Submission = {
  id: number
  user: number
  problem: number
  src: string
  lang: string
  status: 'Accepted' | 'WrongAnswer' | 'PartiallyAccepted' | ErrType
  message: string
  created_at: string
  updated_at: string
}

export type ErrType = 'CompileError' | 'JudgeClientError'

export type RunResult = {
  err: ErrType | null
  data: RunTestCaseResult | string | null
}

export type RunTestCaseResult = {
  status:
    | 'Accepted'
    | 'WrongAnswer'
    | 'TimeLimitExceeded'
    | 'MemoryLimitExceeded'
    | 'RuntimeError'
    | 'SystemError'
  message: string
  output: string
}
