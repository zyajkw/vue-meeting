import { test, expect } from '@playwright/test'

async function enter(page) {
  await page.goto('/')
  await page.getByLabel('DeepSeek API Key', { exact: true }).fill('test-personal-key')
  await page.getByRole('button', { name: '开始对话' }).click()
}

test('key first, then conversation with history; refresh clears everything', async ({ page }) => {
  const sent = []
  await page.route('https://api.deepseek.com/chat/completions', async route => {
    expect(route.request().headers().authorization).toBe('Bearer test-personal-key')
    sent.push(route.request().postDataJSON().messages)
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ choices: [{ message: { content: sent.length === 1 ? '你好，小王' : '你叫小王' } }] }) })
  })
  await page.goto('/')
  await expect(page.getByRole('button', { name: '开始对话' })).toBeDisabled()
  await expect(page.getByLabel('你的消息')).toHaveCount(0)
  await enter(page)
  await page.getByLabel('你的消息').fill('我叫小王')
  await page.getByRole('button', { name: '发送消息' }).click()
  await expect(page.locator('.assistant')).toContainText('你好，小王')
  await page.getByLabel('你的消息').fill('我叫什么？')
  await page.getByRole('button', { name: '发送消息' }).click()
  await expect(page.locator('.assistant').last()).toContainText('你叫小王')
  expect(sent[1]).toHaveLength(3)
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true })
  await page.reload()
  await expect(page.getByLabel('DeepSeek API Key', { exact: true })).toHaveValue('')
  await expect(page.getByRole('log')).toHaveCount(0)
})

test('invalid key preserves input; mobile layout fits; key can be replaced', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('https://api.deepseek.com/chat/completions', route => route.fulfill({ status: 401, body: '{}' }))
  await enter(page)
  await page.getByLabel('你的消息').fill('你好')
  await page.getByRole('button', { name: '发送消息' }).click()
  await expect(page.getByRole('alert')).toContainText('API Key 无效')
  await expect(page.getByLabel('你的消息')).toHaveValue('你好')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true })
  await page.getByRole('button', { name: '更换密钥' }).click()
  await expect(page.getByLabel('DeepSeek API Key', { exact: true })).toHaveValue('')
})
