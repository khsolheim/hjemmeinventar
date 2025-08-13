import puppeteer from 'puppeteer'

const BASE = 'http://localhost:3030'

const paths = [
  '/',
  '/dashboard',
  '/items',
  '/locations',
  '/locations/mobile',
  '/garn',
  '/mobile'
]

async function prepareCLSTracking(page) {
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0
    try {
      const po = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            // @ts-ignore
            window.__cls += entry.value
          }
        }
      })
      po.observe({ type: 'layout-shift', buffered: true })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // noop; buffered observer ensures values are captured
        }
      })
    } catch (e) {}
  })
}

async function measureCLS(page, url) {
  await prepareCLSTracking(page)
  await page.goto(url, { waitUntil: 'networkidle2' })
  await new Promise(r => setTimeout(r, 2000))
  const cls = await page.evaluate(() => (window.__cls ?? 0))
  return cls
}

async function login(page) {
  // Try to access a protected page; if redirected to sign-in, perform login
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2' })
  const currentUrl = page.url()
  if (!/\/auth\/signin/.test(currentUrl)) {
    return
  }
  // Fill form robustly
  const emailHandle = await page.$('input[type="email"], input[name="email"], #email')
  const passwordHandle = await page.$('input[type="password"], input[name="password"], #password')
  if (!emailHandle || !passwordHandle) {
    throw new Error('Sign-in form inputs not found')
  }
  await emailHandle.click({ clickCount: 3 })
  await emailHandle.type('test@example.com')
  await passwordHandle.type('test123')
  const submitHandle = await page.$('button[type="submit"], form button')
  if (!submitHandle) {
    throw new Error('Sign-in submit button not found')
  }
  await Promise.all([
    submitHandle.click(),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ])
}

;(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
  const page = await browser.newPage()
  page.setViewport({ width: 390, height: 844 })
  try {
    await login(page)
  } catch (e) {
    console.error('Login failed (continuing):', e.message)
  }

  const results = []
  for (const p of paths) {
    const url = `${BASE}${p}`
    try {
      const cls = await measureCLS(page, url)
      results.push({ path: p, cls })
      console.log(p, cls.toFixed(3))
    } catch (e) {
      results.push({ path: p, cls: null, error: e.message })
      console.log(p, 'ERR', e.message)
    }
  }

  // Try measuring first item detail by clicking from /items
  try {
    await prepareCLSTracking(page)
    await page.goto(`${BASE}/items`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1500))
    const detailHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/items/"]'))
      // Pick first that looks like /items/<id> (exclude known non-detail paths like enhanced/new/create)
      const first = links
        .map(a => a.getAttribute('href') || '')
        .find(href => /^\/items\/[a-zA-Z0-9][^/?#]*/.test(href) && !/\/items\/(enhanced|new|create)/.test(href))
      return first || null
    })
    if (detailHref) {
      const clsBefore = await page.evaluate(() => window.__cls ?? 0)
      await page.goto(`${BASE}${detailHref}`, { waitUntil: 'networkidle2' })
      await new Promise(r => setTimeout(r, 1500))
      const clsAfter = await page.evaluate(() => window.__cls ?? 0)
      const delta = Math.max(0, clsAfter - clsBefore)
      results.push({ path: detailHref, cls: delta })
      console.log(detailHref, delta.toFixed(3))
    }
  } catch (e) {
    console.log('items/[id]', 'ERR', e.message)
  }

  // Try measuring first yarn batch detail by extracting link from /garn
  try {
    await prepareCLSTracking(page)
    await page.goto(`${BASE}/garn`, { waitUntil: 'networkidle2' })
    await new Promise(r => setTimeout(r, 1500))
    // Navigate into first master detail
    const masterHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="/garn/"]'))
      // Prefer /garn/<id> and exclude register, batch, and query links
      const match = links
        .map(a => a.getAttribute('href') || '')
        .find(href => /^\/garn\/[a-zA-Z0-9][^/?#]*/.test(href) && !/\/garn\/(register|batch|mobile)/.test(href))
      return match || null
    })
    if (masterHref) {
      // Measure master detail directly in isolation
      const masterCls = await measureCLS(page, `${BASE}${masterHref}`)
      results.push({ path: masterHref, cls: masterCls })
      console.log(masterHref, masterCls.toFixed(3))
      let batchHref = await page.evaluate(() => {
        // 1) Any explicit anchor to a batch detail
        const links = Array.from(document.querySelectorAll('a[href*="/batch/"]'))
        const match = links
          .map(a => a.getAttribute('href') || '')
          .find(href => /\/garn\/batch\/[a-zA-Z0-9]/.test(href))
        if (match) return match
        // 2) Look for data-batch-id attributes and compose URL
        const el = document.querySelector('[data-batch-id]')
        if (el) {
          const id = el.getAttribute('data-batch-id')
          if (id) return `/garn/batch/${id}`
        }
        return null
      })
      if (!batchHref) {
        // 3) Fallback: try to derive from any /items/<id> link on the page
        batchHref = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href^="/items/"]'))
          const id = links
            .map(a => a.getAttribute('href') || '')
            .map(h => (h.match(/^\/items\/([^/?#]+)/)?.[1]))
            .find(Boolean)
          return id ? `/garn/batch/${id}` : null
        })
      }
      if (batchHref) {
        const batchCls = await measureCLS(page, `${BASE}${batchHref}`)
        results.push({ path: batchHref, cls: batchCls })
        console.log(batchHref, batchCls.toFixed(3))
      }
    }
  } catch (e) {
    console.log('garn/batch/[id]', 'ERR', e.message)
  }
  await browser.close()
  console.log('\nCLS results:', JSON.stringify(results, null, 2))
})()


