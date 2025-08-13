import puppeteer from 'puppeteer'

const BASE = 'http://localhost:3030'

const paths = [
  '/',
  '/dashboard',
  '/items',
  '/locations',
  '/locations/mobile',
  '/garn'
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
  await page.goto(`${BASE}/auth/signin`, { waitUntil: 'networkidle2' })
  await page.type('#email', 'test@example.com')
  await page.type('#password', 'test123')
  await Promise.all([
    page.click('button[type="submit"]'),
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
      const first = links.find(a => /^\/items\/.+/.test(a.getAttribute('href') || ''))
      return first ? first.getAttribute('href') : null
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
      const link = document.querySelector('a[href^="/garn/"]')
      return link ? link.getAttribute('href') : null
    })
    if (masterHref) {
      await page.goto(`${BASE}${masterHref}`, { waitUntil: 'networkidle2' })
      await new Promise(r => setTimeout(r, 1500))
      const batchHref = await page.evaluate(() => {
        const link = document.querySelector('a[href^="/garn/batch/"]')
        return link ? link.getAttribute('href') : null
      })
      if (batchHref) {
        const clsBefore = await page.evaluate(() => window.__cls ?? 0)
        await page.goto(`${BASE}${batchHref}`, { waitUntil: 'networkidle2' })
        await new Promise(r => setTimeout(r, 1500))
        const clsAfter = await page.evaluate(() => window.__cls ?? 0)
        const delta = Math.max(0, clsAfter - clsBefore)
        results.push({ path: batchHref, cls: delta })
        console.log(batchHref, delta.toFixed(3))
      }
    }
  } catch (e) {
    console.log('garn/batch/[id]', 'ERR', e.message)
  }
  await browser.close()
  console.log('\nCLS results:', JSON.stringify(results, null, 2))
})()


