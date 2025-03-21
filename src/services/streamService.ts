// streamService.ts
// axios不支持responseType为stream，所以只能用fetch

import eventBus from '@/services/eventBus'

/**
 * 处理 token 无效
 */
const handleUnauthorized = async (): Promise<void> => {
  eventBus.emit('showLoginModal')

  await new Promise((resolve, reject) => {
    eventBus.on('loginSuccess', resolve)
    eventBus.on('loginCancel', reject)
  })
}

/**
 * 读取responseType为stream的数据
 */
const processStream = async (
  response: Response,
  onChunkReceived: (chunk: string) => void,
): Promise<void> => {
  if (!response.body) throw new Error(`HTTP body empty! status: ${response.status}`)

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    onChunkReceived(chunk)
  }

  reader.releaseLock()
}

/**
 * 发起请求
 */
export const fetchStreamResponse = async (
  url: string,
  requestInit: RequestInit & { onChunkReceived: (chunk: string) => void },
): Promise<void> => {
  const { onChunkReceived, ...fetchOptions } = requestInit

  while (true) {
    try {
      // 添加 token
      const token = localStorage.getItem('token')
      if (token) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Token ${token}`,
        }
      }

      const response = await fetch(url, fetchOptions)

      if (response.status === 401 || response.status === 403) {
        try {
          await handleUnauthorized()
          continue // 登录完成后重新尝试请求
        } catch {
          throw new Error('用户取消登录')
        }
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      await processStream(response, onChunkReceived)

      break
    } catch (error) {
      throw error
    }
  }
}
