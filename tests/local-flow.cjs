// Run with NODE_PATH=/tmp/dosmicos-hiring-test-tools/node_modules node tests/local-flow.cjs
// All Supabase traffic is mocked. Other external requests are aborted.
const { chromium, webkit } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const results = []
const base = 'http://127.0.0.1:3100'
const seen = new Set()
const inserted = []
async function run(browserType, viewport, name) {
  const browser = await browserType.launch({headless: true, executablePath: browserType === chromium ? process.env.TEST_CHROMIUM_PATH : process.env.TEST_WEBKIT_PATH})
  const context = await browser.newContext({viewport})
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  const email = `${name}@example.test`, beforeInserted = inserted.length
  const profile = name === 'desktop-chromium' ? 'Realización / edición audiovisual' : 'Guion / comunicación digital'
  let mode = 'ok', posts = 0, uploads = 0, lastPayload
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url())
    if (url.hostname === '127.0.0.1' && url.port === '54321') {
      const headers = {'access-control-allow-origin':'*','access-control-allow-headers':req.headers()['access-control-request-headers'] || '*','access-control-allow-methods':'*'}
      if (req.method() === 'OPTIONS') return route.fulfill({status:200,headers})
      if (url.pathname.startsWith('/storage/v1/object/') && req.method() === 'POST') {
        assert.equal(req.headers()['x-upsert'], 'false');
        assert.equal(req.headers().authorization, 'Bearer local-fake-key');
        uploads++
        await new Promise(r => setTimeout(r,250))
        return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({Key: url.pathname.replace('/storage/v1/object/','')})})
      }
      if (url.pathname === '/rest/v1/applications' && req.method() === 'POST') {
        posts++; lastPayload = req.postDataJSON()[0]
        assert.equal(req.headers().authorization, 'Bearer local-fake-key');
        assert.equal((req.headers().prefer || '').includes('return=representation'), false)
        await new Promise(r => setTimeout(r,250))
        if (mode === 'error') return route.fulfill({status:503,headers,contentType:'application/json',body:'{"message":"local test unavailable"}'})
        if (seen.has(lastPayload.id)) return route.fulfill({status:409,headers,contentType:'application/json',body:JSON.stringify({code:'23505',message:'duplicate key value violates unique constraint "applications_pkey"'})})
        seen.add(lastPayload.id); inserted.push(lastPayload)
        return route.fulfill({status:201,headers,body:''})
      }
      if (url.pathname === '/rest/v1/applications' && req.method() === 'GET') return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify([...inserted,{id:'old',full_name:'Histórico local',email:'old@example.test',phone:'1234567',university:'Local',portfolio_link:'',impressive_achievement:'Logro histórico',diagnostic_whats_working:'Diagnóstico histórico',diagnostic_improvements:'Mejora histórica',diagnostic_missed_opportunity:'Oportunidad histórica',campaign_name:'Campaña histórica',campaign_concept:'Concepto histórico',campaign_executions:'Ejecución histórica',budget_challenge:'Reto histórico'}])})
      throw new Error(`Unexpected mock request ${req.method()} ${url}`)
    }
    if (url.origin === base) return route.continue()
    return route.abort()
  })
  async function next() { await page.getByRole('button',{name:'Continuar',exact:true}).click() }
  async function basic(candidateEmail=email) {
    await page.selectOption('#profile',profile)
    await page.fill('#full_name','Candidato de prueba local')
    await page.fill('#email',candidateEmail); await page.fill('#phone','+57 300 1234567')
    await page.fill('#university','Universidad de prueba'); await page.fill('#program','Cine')
    await next()
  }
  async function availability() {
    await page.selectOption('#eligibility','Pendiente de confirmar')
    await page.fill('#start_date','2026-12-01')
    await page.selectOption('#onsite','Sí'); await page.selectOption('#schedule','Necesito ajustes por estudios')
    await next(); await page.locator('#availability_notes-error').waitFor()
    await page.fill('#availability_notes','Clases los miércoles de 08:00 a 10:00')
    await next()
  }
  async function works() {
    await page.fill('#work1_url','https://example.test/video')
    await page.fill('#work1_contribution','Realicé y edité este proyecto académico.')
    await page.fill('#work2_url','https://example.test/guion')
    await page.fill('#work2_contribution','Escribí el guion y diseñé la estructura narrativa.')
  }
  await page.goto(base); await page.getByRole('heading',{name:'Prácticas creativas',exact:true}).waitFor()
  await page.waitForFunction(() => Array.from(document.querySelectorAll('main [style]')).every(el => Number(getComputedStyle(el).opacity) > 0.99))
  await page.screenshot({path:`evidence/${name}-intro.png`,fullPage:true})
  assert(!/más rápido crecimiento|220%|6x|48-72|Diagnóstico|Campaña mayo/.test(await page.locator('main').innerText()))
  await next(); await page.locator('#profile-error').waitFor()
  await basic(); await availability(); await works()
  await page.getByRole('button',{name:'Anterior',exact:true}).click()
  assert.equal(await page.inputValue('#availability_notes'),'Clases los miércoles de 08:00 a 10:00')
  await page.getByRole('button',{name:'Anterior',exact:true}).click()
  assert.equal(await page.inputValue('#program'),'Cine')
  await next(); await next(); assert.equal(await page.inputValue('#work1_contribution'),'Realicé y edité este proyecto académico.')
  await page.getByRole('button',{name:'Enviar postulación',exact:true}).click()
  await page.locator('#portfolio_link-error').waitFor(); assert.equal(posts,0)
  await page.fill('#portfolio_link','javascript:alert(1)')
  await page.getByRole('button',{name:'Enviar postulación',exact:true}).click()
  assert.equal(posts,0)
  await page.fill('#portfolio_link','https://example.test/portfolio')
  await page.locator('#resume-upload').setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('invalid')})
  await page.getByText('Selecciona un archivo PDF o Word de máximo 5 MB.',{exact:true}).waitFor(); assert.equal(uploads,0)
  await page.locator('#resume-upload').setInputFiles({name:'huge.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(5*1024*1024+1)})
  assert.equal(uploads,0)
  await page.locator('#resume-upload').setInputFiles({name:'cv.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nlocal fixture')})
  await page.getByText('Archivo subido: cv.pdf',{exact:true}).waitFor(); assert.equal(uploads,1)
  await page.fill('#portfolio_link','') // CV alone is accepted; duplicate retry below uses portfolio alone.
  await page.getByRole('button',{name:'Anterior',exact:true}).click(); await next()
  await page.getByText('Archivo subido: cv.pdf',{exact:true}).waitFor()
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow')
  await page.screenshot({path:`evidence/${name}-works.png`,fullPage:true})
  mode = 'error'
  await page.getByRole('button',{name:'Enviar postulación',exact:true}).click()
  await page.getByText(/No pudimos confirmar el envío/).waitFor()
  assert.equal(await page.inputValue('#work1_url'),'https://example.test/video')
  const failedId=lastPayload.id
  mode='ok'
  await page.getByRole('button',{name:'Enviar postulación',exact:true}).evaluate(el=>{el.click();el.click();el.click()})
  await page.getByRole('heading',{name:'Postulación recibida',exact:true}).waitFor()
  assert.equal(posts,2); assert.equal(lastPayload.id,failedId)
  assert.equal(lastPayload.creative_application.works.length,2)
  assert.equal(lastPayload.diagnostic_whats_working,'')
  assert.equal(lastPayload.creative_application.profile,profile)
  await page.reload(); await basic(` ${email.toUpperCase()} `); await availability(); await works()
  await page.fill('#portfolio_link','https://example.test/portfolio')
  await page.getByRole('button',{name:'Enviar postulación',exact:true}).click()
  await page.getByRole('heading',{name:'Postulación recibida',exact:true}).waitFor()
  assert.equal(lastPayload.id,failedId); assert.equal(inserted.length,beforeInserted+1)
  assert.deepEqual(errors,[])
  results.push(`${name}: validación, URL, CV tipo/tamaño, carga, retroceso, errores, reintento, doble clic y duplicado tras recarga OK`)
  await browser.close()
}
;(async()=>{await run(chromium,{width:1440,height:1000},'desktop-chromium'); await run(chromium,{width:390,height:844},'mobile-chromium'); await run(webkit,{width:375,height:812},'mobile-webkit'); fs.writeFileSync('evidence/test-results.json',JSON.stringify({results,insertedCount:inserted.length,productionRequests:0,testedFramework:require('../package.json').dependencies.next},null,2)); console.log(results.join('\n'))})().catch(e=>{console.error(e); process.exit(1)})
