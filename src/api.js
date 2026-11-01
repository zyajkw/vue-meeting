export async function ask(messages, apiKey, fetcher = fetch) {
  if (!apiKey.trim()) throw new Error('请先输入自己的 DeepSeek API Key。')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 70000)
  try {
    const response = await fetcher('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({ model: 'deepseek-flash', messages, thinking: { type: 'disabled' } }),
      signal: controller.signal,
    })
    if (!response.ok) {
      const hints = { 401: 'API Key 无效，请检查后重新输入。', 402: '账户余额不足，请检查 DeepSeek 账户。', 429: '请求过于频繁，请稍后重试。' }
      throw new Error(hints[response.status] || `请求失败（HTTP ${response.status}），请稍后重试。`)
    }
    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content
    if (typeof answer !== 'string' || !answer.trim()) throw new Error('模型返回了空回复，请重试。')
    return answer
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('等待超过 70 秒，请稍后重试。')
    if (error instanceof TypeError) throw new Error('无法连接 DeepSeek，请检查网络。浏览器跨域限制也可能导致此错误。')
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
