const {chromium,webkit}=require('playwright')
const assert=require('node:assert/strict'),fs=require('node:fs')
const base='http://127.0.0.1:3100',seen=new Set(),inserted=[],results=[]
async function run(engine,viewport,name){
 const browser=await engine.launch({headless:true,executablePath:engine===chromium?process.env.TEST_CHROMIUM_PATH:process.env.TEST_WEBKIT_PATH})
 try{
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 const email=`${name}@example.test`,baseline=inserted.length,profile=name==='desktop-chromium'?'Realización / edición audiovisual':'Guion / comunicación digital'
 let mode='ok',posts=0,uploads=0,payload
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url())
  if(url.origin==='http://127.0.0.1:54321'){
   const headers={'access-control-allow-origin':'*','access-control-allow-headers':req.headers()['access-control-request-headers']||'*','access-control-allow-methods':'*'}
   if(req.method()==='OPTIONS')return route.fulfill({status:200,headers})
   if(url.pathname.startsWith('/storage/v1/object/')&&req.method()==='POST'){
    assert.equal(req.headers()['x-upsert'],'false');assert.equal(req.headers().authorization,'Bearer local-fake-key');uploads++
    return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({Key:url.pathname.replace('/storage/v1/object/','')})})
   }
   if(url.pathname==='/rest/v1/applications'&&req.method()==='POST'){
    assert.equal(req.headers().authorization,'Bearer local-fake-key');assert(!(req.headers().prefer||'').includes('return=representation'))
    posts++;payload=req.postDataJSON()[0];await new Promise(r=>setTimeout(r,250))
    if(mode==='error')return route.fulfill({status:503,headers,contentType:'application/json',body:'{"message":"local unavailable"}'})
    if(seen.has(payload.id))return route.fulfill({status:409,headers,contentType:'application/json',body:JSON.stringify({code:'23505',message:'duplicate key value violates unique constraint "applications_pkey"'})})
    seen.add(payload.id);inserted.push(payload);return route.fulfill({status:201,headers,body:''})
   }
   throw Error(`Unexpected mock ${req.method()} ${url.pathname}`)
  }
  if(url.origin===base)return route.continue()
  return route.abort()
 })
 async function basic(candidate=email){await page.fill('#full_name','Postulante local');await page.fill('#email',candidate);await page.selectOption('#profile',profile);await page.fill('#university','Universidad local');await page.fill('#program','Carrera local');await page.fill('#impressive_achievement','Organicé un proyecto comunitario fuera de la universidad.')}
 async function cv(){await page.locator('#resume-upload').setInputFiles({name:'cv.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nlocal fixture')});await page.getByText('Archivo subido: cv.pdf',{exact:true}).waitFor()}
 const submit=()=>page.getByRole('button',{name:'Enviar postulación',exact:true}).click()
 await page.goto(base);await page.getByRole('heading',{name:'Tu postulación',exact:true}).waitFor();await page.waitForFunction(()=>Array.from(document.querySelectorAll('main [style]')).every(e=>Number(getComputedStyle(e).opacity)>.99))
 await page.screenshot({path:`evidence/${name}-brief-empty.png`,fullPage:true})
 assert.equal(await page.locator('input').count(),6);assert.equal(await page.locator('textarea').count(),1);assert.equal(await page.locator('select').count(),1)
 assert(!/Diagnóstico|Campaña mayo|Trabajo 1|Trabajo 2|220%|6x|48.72/.test(await page.locator('main').innerText()))
 for(const id of ['phone','eligibility','start_date','onsite','schedule','work1_url'])assert.equal(await page.locator(`#${id}`).count(),0)
 await submit();await page.locator('#full_name-error').waitFor();assert.equal(posts,0)
 await basic();await page.fill('#portfolio_link','https://example.test/portfolio');await submit();await page.locator('#resume_url-error').waitFor();assert.equal(posts,0)
 await page.locator('#resume-upload').setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('invalid')});await page.getByText('Selecciona un archivo PDF o Word de máximo 5 MB.',{exact:true}).waitFor();assert.equal(uploads,0)
 await page.locator('#resume-upload').setInputFiles({name:'huge.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(5*1024*1024+1)});assert.equal(uploads,0)
 await cv();assert.equal(uploads,1)
 await page.fill('#portfolio_link','javascript:alert(1)');await submit();await page.locator('#portfolio_link-error').waitFor();assert.equal(posts,0)
 await page.fill('#portfolio_link','') // Optional portfolio cannot be required by old validation.
 mode='error';await submit();await page.getByText(/No pudimos confirmar el envío/).waitFor();assert.equal(await page.inputValue('#impressive_achievement'),'Organicé un proyecto comunitario fuera de la universidad.');const failedId=payload.id
 mode='ok';await page.getByRole('button',{name:'Enviar postulación',exact:true}).evaluate(e=>{e.click();e.click();e.click()});await page.getByRole('heading',{name:'Postulación recibida',exact:true}).waitFor();assert.equal(posts,2);assert.equal(payload.id,failedId)
 assert.equal(payload.phone,'');assert.equal(payload.university,'Universidad local');assert.equal(payload.impressive_achievement,'Organicé un proyecto comunitario fuera de la universidad.');assert.deepEqual(payload.creative_application,{version:'creative-2026-brief-v2',profile,program:'Carrera local'});assert(!payload.portfolio_link)
 await page.reload();await basic(` ${email.toUpperCase()} `);await cv();await submit();await page.getByRole('heading',{name:'Postulación recibida',exact:true}).waitFor();assert.equal(payload.id,failedId);assert.equal(inserted.length,baseline+1);assert.deepEqual(errors,[])
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));results.push(`${name}: eight fields, exact question, CV required, optional portfolio, removed requirements absent, validation/file/URL/errors/retry/double-click/reload duplicate OK`)
 }finally{await browser.close()}
}
;(async()=>{await run(chromium,{width:1440,height:1000},'desktop-chromium');await run(chromium,{width:390,height:844},'mobile-chromium');await run(webkit,{width:375,height:812},'mobile-webkit');fs.writeFileSync('evidence/test-results.json',JSON.stringify({results,insertedCount:inserted.length,productionRequests:0},null,2));console.log(results.join('\n'))})().catch(e=>{console.error(e);process.exit(1)})
