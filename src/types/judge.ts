export type TestCase = {
  id: number
  ordinal: number
  title: string
  input: string
  output: string
}

export type TestCaseResult = {
  id: number
  submission: number
  test_case: number
  result: ResultCode
  cpu_time: number
  real_time: number
  memory: number
  output: string
  exit_code: number
  signal: number
  error: ErrorCode
}

export enum ResultCode {
  WRONG_ANSWER = -1,
  SUCCESS = 0,
  CPU_TIME_LIMIT_EXCEEDED = 1,
  REAL_TIME_LIMIT_EXCEEDED = 2,
  MEMORY_LIMIT_EXCEEDED = 3,
  RUNTIME_ERROR = 4,
  SYSTEM_ERROR = 5,
}

export enum ErrorCode {
  SUCCESS = 0,
  INVALID_CONFIG = -1,
  CLONE_FAILED = -2,
  PTHREAD_FAILED = -3,
  WAIT_FAILED = -4,
  ROOT_REQUIRED = -5,
  LOAD_SECCOMP_FAILED = -6,
  SETRLIMIT_FAILED = -7,
  DUP2_FAILED = -8,
  SETUID_FAILED = -9,
  EXECVE_FAILED = -10,
  SPJ_ERROR = -11,
}

export type Submission = {
  id: number
  user: number
  problem: number
  src: string
  lang: string
  err: ErrType | null
  error_reason: string | null
  created_at: string
  updated_at: string
}

export type ErrType = 'CompileError' | 'JudgeClientError'

export type RunResult = {
  err: ErrType | null
  data: Array<RunTestCaseResult> | string | null
}

export type RunTestCaseResult = {
  test_case: string
  result: ResultCode
  cpu_time: number
  real_time: number
  memory: number
  output: string
  output_md5: string
  exit_code: number
  signal: number
  error: ErrorCode
}
