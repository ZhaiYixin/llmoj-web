// streamService.ts
// axios不支持responseType为stream，所以只能用fetch

export const fetchStreamResponse = async (
  url: string,
  requestInit: RequestInit & { onChunkReceived: (chunk: string) => void },
): Promise<void> => {
  const { onChunkReceived, ...fetchOptions } = requestInit

  try {
    const response = await fetch(url, fetchOptions)

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
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
  } catch (error) {
    throw error
  }
}
