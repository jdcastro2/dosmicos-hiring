const assert = require('node:assert/strict')
const http = require('node:http')
const fs = require('node:fs')
const { spawn } = require('node:child_process')
const { chromium, webkit } = require('/tmp/dosmicos-hiring-test-tools/node_modules/playwright')
const ORIGIN = 'http://127.0.0.1:3001', DB = 'http://127.0.0.1:54321'
const ADMIN = '954ca339-7d04-4e5a-bc27-bd9b0e14dcec'
const OTHER = '00000000-0000-4000-8000-000000000002'
const id = '00000000-0000-4000-8000-000000000001'
const evilId = '00000000-0000-4000-8000-000000000003'
const fixture = { id, created_at: '2026-10-01T12:00:00Z', full_name: 'Fixture local', email: 'fixture@example.test', phone: '0000000000', university: 'Universidad fixture', portfolio_link: 'https://example.test/portfolio', resume_url: `${DB}/storage/v1/object/public/resumes/historical.pdf`, impressive_achievement: 'Trabajo fixture', diagnostic_whats_working: 'Fixture A', diagnostic_improvements: 'Fixture B', diagnostic_missed_opportunity: 'Fixture C', campaign_name: '=fixture', campaign_concept: 'Fixture "con comillas"', campaign_executions: 'Fixture E', budget_challenge: 'Fixture F' }
fixture.creative_application = {version:'creative-2026-v1',profile:'Guion / comunicación digital',program:'Comunicación',eligibility:'Sí, estoy habilitado/a',start_date:'2026-12-01',onsite:'Sí',schedule:'Compatible con mis estudios',availability_notes:'',works:[{url:'https://example.test/one',contribution:'Aporte creativo fixture uno'},{url:'https://example.test/two',contribution:'Aporte creativo fixture dos'}]}
const historical = {...fixture,id:'00000000-0000-4000-8000-000000000004',full_name:'Histórico fixture',creative_application:undefined,campaign_name:'Campaña histórica fixture'}
const jwt = kind => ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ sub: kind === 'other' ? OTHER : ADMIN, exp: Math.floor(Date.now()/1000)+3600, kind })).toString('base64url'), 'local-test-signature'].join('.')
const tokens = { admin: jwt('admin'), other: jwt('other'), wrongemail: jwt('wrongemail') }
const user = kind => ({ id: kind === 'other' ? OTHER : ADMIN, email: kind === 'wrongemail' ? 'other@example.test' : kind === 'other' ? 'nonadmin@example.test' : 'julian@dosmicos.co', aud: 'authenticated', role: 'authenticated', email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' })
const calls=[], results=[]
let rejectAdmin = false
let next, mock
const json = (res,status,data) => {res.writeHead(status, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info,x-supabase-api-version,x-upsert,cache-control,prefer','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end(JSON.stringify(data))}
const body = req => new Promise(resolve=>{let value='';req.on('data',x=>value+=x);req.on('end',()=>resolve(value))})
const server = http.createServer(async (req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':req.headers['access-control-request-headers']||'','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});return res.end()}
 const path=new URL(req.url,DB); const kind=Object.entries(tokens).find(([,token])=>req.headers.authorization===`Bearer ${token}`)?.[0]
 const raw=await body(req);calls.push({path:path.pathname,method:req.method,kind:kind||'anon',prefer:req.headers.prefer,body:raw.length<200?raw:undefined})
 if(path.pathname==='/auth/v1/token') {const input=JSON.parse(raw);const who=input.email==='julian@dosmicos.co'?'admin':'other';return json(res,200,{access_token:tokens[who],refresh_token:'local-refresh',expires_in:3600,token_type:'bearer',user:user(who)})}
 if(path.pathname==='/auth/v1/user')return kind && !(kind==='admin' && rejectAdmin)?json(res,200,user(kind)):json(res,401,{message:'Invalid token'})
 if(path.pathname==='/auth/v1/logout')return json(res,200,{})
 if(path.pathname==='/rest/v1/applications') {
  if(req.method==='POST') { assert.equal(kind,undefined,'public form must remain anon');assert(!String(req.headers.prefer).includes('return=representation'));return json(res,201,null) }
  assert.equal(kind,'admin','server must only query after admin authorization')
  if(path.searchParams.has('id')) {const target=path.searchParams.get('id').slice(3);return json(res,200,target===evilId?{resume_url:'https://other.example.test/storage/v1/object/public/resumes/file.pdf'}:target===id?{resume_url:fixture.resume_url}:null)}
  return json(res,200,[fixture,historical])
 }
 if(path.pathname.startsWith('/storage/v1/object/sign/resumes/') && req.method==='GET') {res.writeHead(200,{'Content-Type':'text/plain'});return res.end('CV fixture local sin datos personales')}
 if(path.pathname.startsWith('/storage/v1/object/sign/resumes/')) {assert.equal(kind,'admin');assert.equal(JSON.parse(raw).expiresIn,60);return json(res,200,{signedURL:'/object/sign/resumes/historical.pdf?token=local-expiring-link'})}
 if(path.pathname.startsWith('/storage/v1/object/resumes/')&&req.method==='POST') {assert.equal(kind,undefined);assert.equal(req.headers['x-upsert'],'false');return json(res,200,{Key:'resumes/local-fixture.pdf',Id:id})}
 if(path.pathname.startsWith('/storage/v1/object/public/resumes/'))return json(res,404,{error:'Private bucket'})
 return json(res,404,{error:'Unexpected local mock route'})
})
async function api(path,token){return fetch(ORIGIN+path,{headers:token?{Authorization:`Bearer ${token}`}:{}})}
async function main(){
 await new Promise(r=>server.listen(54321,'127.0.0.1',r));mock=server
 const log=fs.openSync('evidence/server.log','w')
 next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3001','-H','127.0.0.1'],{env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:DB,NEXT_PUBLIC_SUPABASE_ANON_KEY:'local-fake-key'},stdio:['ignore',log,log]})
 for(let i=0;i<100;i++){try{if((await fetch(ORIGIN+'/admin')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 const before=()=>calls.filter(c=>c.path.startsWith('/rest/')||c.path.includes('/object/sign/')).length
 for(const [label,token,status] of [['anonymous',undefined,401],['forged legacy token','dosmicos_admin_authenticated',401],['invalid token','invalid',401],['authenticated nonadmin',tokens.other,403],['right UUID wrong email',tokens.wrongemail,403]]) {
  const baseline=before()
  for(const route of ['/api/admin/applications','/api/admin/session',`/api/admin/applications/${id}/resume`]){const response=await api(route,token);assert.equal(response.status,status,label);assert.match(response.headers.get('cache-control'),/no-store/)}
  assert.equal(before(),baseline,`${label} must never query records or sign files`);results.push(`${label}: rejected before data access`)
 }
 const adminResponse=await api('/api/admin/applications',tokens.admin);assert.equal(adminResponse.status,200);assert.deepEqual(await adminResponse.json(),JSON.parse(JSON.stringify([fixture,historical])));assert.match(adminResponse.headers.get('cache-control'),/private, no-store/)
 const cv=await api(`/api/admin/applications/${id}/resume`,tokens.admin);assert.equal(cv.status,200);const link=await cv.json();assert.equal(link.expiresIn,60);assert(link.url.startsWith(`${DB}/storage/v1/object/sign/resumes/`))
 assert.equal((await api(`/api/admin/applications/${evilId}/resume`,tokens.admin)).status,422)
 assert.equal((await api('/api/admin/applications/not-a-uuid/resume',tokens.admin)).status,400)
 results.push('Admin API and signed CV: verified session/identity, no-store, record-derived same-project path, 60-second expiry; external URL rejected')
 for(const [engine,label,options] of [[chromium,'desktop Chromium',{viewport:{width:1440,height:1000}}],[chromium,'mobile Chromium',{viewport:{width:390,height:844},isMobile:true,hasTouch:true}],[webkit,'mobile WebKit',{viewport:{width:375,height:812},isMobile:true,hasTouch:true}]]) {
  const browser=await engine.launch({headless:true,...(engine===chromium?{executablePath:'/Users/juliancastro/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell'}:{executablePath:'/Users/juliancastro/Library/Caches/ms-playwright/webkit-2336/pw_run.sh'})})
  try {
   const context=await browser.newContext({...options,acceptDownloads:true})
   await context.route('**/*',route=>{const host=new URL(route.request().url()).hostname;return ['127.0.0.1','localhost'].includes(host)?route.continue():route.abort()})
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message))
   page.on('console',m=>{if(m.type()==='error')console.log(label, m.text())});await page.goto(ORIGIN+'/admin');await page.getByRole('button',{name:'Iniciar sesión'}).waitFor()
   await page.evaluate(()=>localStorage.setItem('admin_token','dosmicos_admin_authenticated'));await page.reload();await page.getByRole('button',{name:'Iniciar sesión'}).waitFor();assert.equal(await page.getByText('Fixture local',{exact:true}).count(),0)
   await page.getByLabel('Correo electrónico',{exact:true}).fill('nonadmin@example.test');await page.getByLabel('Contraseña',{exact:true}).fill('fixture-password');await page.getByRole('button',{name:'Iniciar sesión'}).click();await page.getByText('Esta cuenta no tiene acceso al panel',{exact:true}).waitFor().catch(async e=>{console.log(label, await page.locator('body').innerText(),calls.slice(-5).map(({path,method,kind})=>({path,method,kind})));throw e})
   await page.getByLabel('Correo electrónico',{exact:true}).fill('julian@dosmicos.co');await page.getByLabel('Contraseña',{exact:true}).fill('fixture-password');await page.getByRole('button',{name:'Iniciar sesión'}).click();await page.getByText('Fixture local',{exact:true}).waitFor()
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth))
   await page.screenshot({path:`evidence/${label.replaceAll(' ','-')}-admin.png`,fullPage:true})
   const csvButton=page.getByRole('button',{name:/CSV/});const [csvDownload]=await Promise.all([page.waitForEvent('download'),csvButton.click()]);await csvDownload.saveAs(`evidence/${label.replaceAll(' ','-')}-fixture.csv`)
   const csv=fs.readFileSync(`evidence/${label.replaceAll(' ','-')}-fixture.csv`,'utf8');assert(csv.includes("'=fixture"));assert(csv.includes('""con comillas""'));assert(!csv.includes('/object/public/'));assert(csv.includes('Aporte creativo fixture uno'));assert(csv.includes('Campaña histórica fixture'))
   const [pdfDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Descargar',exact:true}).first().click()]);await pdfDownload.saveAs(`evidence/${label.replaceAll(' ','-')}-fixture.pdf`);assert(fs.statSync(`evidence/${label.replaceAll(' ','-')}-fixture.pdf`).size>1000)
   await page.getByRole('row').filter({hasText:'Fixture local'}).getByRole('button',{name:'Ver',exact:true}).click();await page.getByText(/Aporte personal: Aporte creativo fixture uno/).waitFor();await page.getByRole('button',{name:'Abrir CV privado',exact:true}).waitFor();const [popup]=await Promise.all([page.waitForEvent('popup'),page.getByRole('button',{name:'Abrir CV privado',exact:true}).click()]);await popup.waitForURL('**/storage/v1/object/sign/resumes/**');assert(!popup.url().includes('/object/public/'));await popup.close();await page.locator('button').filter({has:page.locator('path[d="M6 18L18 6M6 6l12 12"]')}).click()
   // Probar también formulario mientras hay sesión admin: usa cliente anon independiente.
   const form=await context.newPage();form.on('console',m=>{if(m.type()==='error')console.log(label,'form:',m.text())});form.on('dialog',d=>{console.log(label,'local form alert:',d.message());d.dismiss()});await form.goto(ORIGIN);await form.selectOption('#profile','Guion / comunicación digital');await form.fill('#full_name','Postulante fixture');await form.fill('#email','fixture@example.test');await form.fill('#phone','0000000000');await form.fill('#university','Universidad fixture');await form.fill('#program','Comunicación');await form.getByRole('button',{name:'Continuar'}).click()
   await form.selectOption('#eligibility','Sí, estoy habilitado/a');await form.fill('#start_date','2026-12-01');await form.selectOption('#onsite','Sí');await form.selectOption('#schedule','Compatible con mis estudios');await form.getByRole('button',{name:'Continuar'}).click()
   await form.locator('input[type=file]').setInputFiles({name:'fixture.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nFixture sin datos personales\n%%EOF')});await form.getByText('Archivo subido: fixture.pdf',{exact:true}).waitFor()
   for(const n of [1,2]){await form.fill(`#work${n}_url`,`https://example.test/fixture${n}`);await form.fill(`#work${n}_contribution`,`Aporte fixture ${n}`)}
   await form.getByRole('button',{name:'Enviar postulación'}).click();await form.getByRole('heading',{name:'Postulación recibida',exact:true}).waitFor()
   await form.screenshot({path:`evidence/${label.replaceAll(' ','-')}-public-success.png`,fullPage:true})
   rejectAdmin=true;let deniedDownload=false;page.on('download',()=>{deniedDownload=true});await page.getByRole('button',{name:/CSV/}).click();await page.getByRole('button',{name:'Iniciar sesión'}).waitFor();assert.equal(deniedDownload,false,'revoked admin must not export cached data');rejectAdmin=false
   await page.getByLabel('Correo electrónico',{exact:true}).fill('julian@dosmicos.co');await page.getByLabel('Contraseña',{exact:true}).fill('fixture-password');await page.getByRole('button',{name:'Iniciar sesión'}).click();await page.getByText('Fixture local',{exact:true}).waitFor()
   await page.getByRole('button',{name:/Cerrar sesión/}).click();await page.getByRole('button',{name:'Iniciar sesión'}).waitFor();assert.equal(await page.getByText('Fixture local',{exact:true}).count(),0);assert.deepEqual(errors,[])
   results.push(`${label}: legacy token denied, nonadmin denied, Supabase-session flow (mock), CSV/PDF, private CV, revoked session cannot export, anon upload/insert with admin session, logout, no horizontal overflow`)
   await context.close()
  }finally{await browser.close()}
 }
 fs.writeFileSync('evidence/security-test-results.json',JSON.stringify({productionRequests:0,fixtureOnly:true,results},null,2)+'\n')
 console.log(JSON.stringify({passed:results.length,results},null,2))
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{next?.kill('SIGTERM');if(mock)await new Promise(r=>mock.close(r))})
