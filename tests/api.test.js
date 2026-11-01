import test from 'node:test'
import assert from 'node:assert/strict'
import { ask } from '../src/api.js'

test('missing key prevents requests', async () => {
  await assert.rejects(ask([{ role: 'user', content: '你好' }], ''), /API Key/)
})

test('browser sends own key and conversation directly to DeepSeek', async () => {
  const messages = [{ role: 'user', content: '我叫小王' }, { role: 'assistant', content: '你好' }, { role: 'user', content: '我叫什么？' }]
  const answer = await ask(messages, 'my-key', async (url, options) => {
    assert.equal(url, 'https://api.deepseek.com/chat/completions')
    assert.equal(options.headers.Authorization, 'Bearer my-key')
    assert.deepEqual(JSON.parse(options.body).messages, messages)
    return new Response(JSON.stringify({ choices: [{ message: { content: '小王' } }] }))
  })
  assert.equal(answer, '小王')
})

test('authentication failures give readable feedback', async () => {
  await assert.rejects(ask([], 'invalid', async () => new Response('{}', { status: 401 })), /API Key 无效/)
})

test('network failures explain CORS as a possible cause', async () => {
  await assert.rejects(ask([], 'test', async () => { throw new TypeError('Failed to fetch') }), /跨域/)
})
