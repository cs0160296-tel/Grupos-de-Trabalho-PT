import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {emptyFilters,filterGroups,readFilters,csv,fold,statuses} from '../src/core.ts';
const d=JSON.parse(readFileSync('public/data.json','utf8'));
const audit=JSON.parse(readFileSync('public/audit-completo.json','utf8'));
test('historical snapshot counts and status categories reconcile',()=>{assert.equal(d.cutoff,'2026-10-10');assert.equal(d.groups.length,122);assert.deepEqual(d.metrics.governments,{XXIV:74,XXV:48});assert.deepEqual(statuses.map(s=>d.groups.filter(g=>g.status===s).length),[2,2,20,62,4,3,29]);assert.equal(new Set(d.groups.map(g=>g.url)).size,116);assert.equal(Number(d.metrics.average_delay.toFixed(1)),369.7);assert.equal(d.metrics.max_delay,888)});
test('IDs, all deadlines, source URLs and one-to-many joins',()=>{const ids=new Set(d.groups.map(g=>g.id));assert.equal(ids.size,122);assert.equal(d.deadlines.length,441);assert.equal(new Set(d.deadlines.map(x=>x.id)).size,441);assert.equal(d.groups.reduce((s,g)=>s+g.deadlines.length,0),441);d.deadlines.forEach(x=>{assert(ids.has(x.group_id));assert(x.source_url.startsWith('https://'))});d.groups.forEach(g=>{assert(g.url.startsWith('https://diariodarepublica.pt/'));assert(g.portfolios.length);assert.equal(new Set(g.portfolios).size,g.portfolios.length);assert(g.mission_pt);assert(g.status_explanation_pt)});assert.equal(Object.keys(audit.sheets).length,9);assert(audit.dashboard_cells.length);assert.equal(audit.sheets.Groups.length,122);assert.equal(audit.sheets.Deadlines.length,441)});
test('passport source, snapshot benchmark and preserved legal wording',()=>{const g=d.groups.find(g=>g.id==='GT-2024-046');assert.equal(g.delay_days,102);assert.equal(g.deadline_current,'2026-06-30');assert.equal(g.url,'https://diariodarepublica.pt/dr/detalhe/despacho/14284-2024-898695314');assert(g.deadlines.some(x=>x.due==='2025-01-16'));assert(g.objective_pt.includes('passaporte'));assert(g.policy_pt.includes('cinco'));assert.equal(g.last_checked,'2026-10-10')});
test('accent-insensitive search and combined URL filters',()=>{assert.equal(fold('JUSTIÇA'),'justica');assert.equal(filterGroups(d.groups,{...emptyFilters,q:'passaporte'}).length,1);assert.deepEqual(filterGroups(d.groups,{...emptyFilters,q:'justica'}).map(g=>g.id),filterGroups(d.groups,{...emptyFilters,q:'justiça'}).map(g=>g.id));const f=readFilters(new URLSearchParams('government=XXV&status=Em+atraso&status=Sem+informa%C3%A7%C3%A3o+p%C3%BAblica'));assert.equal(filterGroups(d.groups,f).length,29);assert.equal(filterGroups(d.groups,{...emptyFilters,government:'XXIV'}).length,74);assert.equal(filterGroups(d.groups,{...emptyFilters,status:['Em atraso']}).length,62);assert.equal(filterGroups(d.groups,{...emptyFilters,month:'2024-12'}).length,6);assert.equal(filterGroups(d.groups,{...emptyFilters,q:'termoinexistenteabcdef'}).length,0)});
test('CSV contains only filtered rows, escaped values and source columns',()=>{const groups=filterGroups(d.groups,{...emptyFilters,q:'passaporte'});const out=csv(groups);assert(out.startsWith('\uFEFF'));assert(out.includes('GT-2024-046'));assert(out.includes('Designação no diploma'));assert(!out.includes('GT-2024-001'));assert(out.includes('https://diariodarepublica.pt/dr/detalhe/despacho/14284-2024-898695314'));assert(out.includes('2026-10-10'));assert(csv([{...groups[0],name:'Nome "citado"'}]).includes('Nome ""citado""'))});
test('coverage distinction, immutable source workbook and translations',()=>{assert.equal(d.metrics.screened_urls,3251);assert.equal(d.metrics.monthly_allocated_urls,3142);assert.equal(d.sheets.Coverage.length,31);assert.equal(d.sheets['Act review'].length,292);assert.equal(d.sheets['Discovery gaps'].length,9);assert.equal(d.sheets['Related bodies'].length,15);const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');assert.equal(hash('data/source.xlsx'),hash('public/fonte-original.xlsx'));assert.equal(hash('data/source.xlsx'),d.source.sha256)});
const requireBuild=()=>{if(!existsSync('dist/sitemap.xml'))throw new Error('dist/ em falta: correr "npm run build" antes de "npm test". Estes testes verificam o HTML servido e não podem passar sem ele.')};
test('built route files cover every group with source, title and legal text',()=>{requireBuild();d.groups.forEach(g=>{const h=readFileSync(`dist/grupos/${g.id}/index.html`,'utf8');assert(h.includes(g.id));assert(h.includes(g.url));assert(h.includes('<title>'));assert(h.includes('application/ld+json'));assert(h.includes('Missão e objetivos'));assert(h.includes(g.display_name))})});

test('deployment paths include the configured base and keep every route and download reachable',()=>{
 requireBuild();
 const base=(process.env.SITE_BASE_PATH||'/').replace(/\/$/,'');
 const origin=(process.env.SITE_URL||'https://cs0160296-tel.github.io/Grupos-de-Trabalho-PT').replace(/\/$/,'');
 for(const route of ['', '/explorar','/grupos/GT-2024-046']){
  const h=readFileSync(`dist${route}/index.html`,'utf8');
  for(const [,url] of h.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g))assert(url.startsWith(base+'/'),`Wrong deployment path: ${url}`);
  assert(h.includes(`href="${base}/explorar"`));
  assert(h.includes(`href="${origin}${route||'/'}"`));
 }
 assert(readFileSync('dist/sitemap.xml','utf8').includes(origin+'/grupos/GT-2024-046'));
 assert(existsSync('dist/.nojekyll'));
});


/* Testes de regra. Os testes acima fixam o retrato — protegem contra deriva acidental,
   mas passariam com qualquer número. Estes verificam que a classificação obedece à
   regra declarada, e pinam as anomalias conhecidas do ficheiro de origem para que não
   cresçam sem ser notadas. Não relaxar um destes para esconder uma divergência:
   a divergência corrige-se em data/source.xlsx. */

test('regra: «Em atraso» exige um prazo vencido e um atraso medido',()=>{
 const overdue=d.groups.filter(g=>g.status==='Em atraso');
 assert.equal(overdue.length,62);
 for(const g of overdue){
  assert.notEqual(g.delay_days,null,`${g.id}: Em atraso sem dias de atraso`);
  assert(g.delay_days>=0,`${g.id}: atraso negativo`);
  assert(g.deadline_current,`${g.id}: Em atraso sem prazo de referência`);
  assert(g.deadline_current<d.cutoff,`${g.id}: prazo ainda não vencido ao corte`);
 }
});

test('regra: um estado «Concluído» exige evidência de entrega',()=>{
 for(const g of d.groups.filter(g=>g.status.startsWith('Concluído')))
  assert(g.has_delivery_evidence,`${g.id}: concluído sem evidência de entrega`);
});

test('regra: nenhuma entrega é datada antes da publicação do ato',()=>{
 for(const g of d.groups) if(g.delivery_date)
  assert(g.delivery_date>=g.published,`${g.id}: entrega ${g.delivery_date} anterior à publicação ${g.published}`);
});

test('qualidade dos dados: anomalias conhecidas de data/source.xlsx, pinadas',()=>{
 const published=Object.fromEntries(d.groups.map(g=>[g.id,g.published]));
 const premature=d.deadlines.filter(x=>x.due&&published[x.group_id]&&x.due<published[x.group_id]);
 // Prazos de entrega com data anterior ao ato que os cria: linhas da folha Deadlines que
 // citam texto que não é uma obrigação de entrega (ex.: GT-2024-003-D01 cita uma alínea da
 // composição). Corrigir no Excel fará este número descer — então baixar o valor aqui.
 assert.equal(premature.length,7,'Prazos anteriores à publicação: corrigir no Excel, não relaxar o teste');
 assert(premature.some(x=>x.id==='GT-2024-003-D01'));
 // Entrega documentada sem estado «Concluído». Decisão editorial em aberto: ver PR de auditoria.
 assert.equal(d.groups.filter(g=>g.has_delivery_evidence&&!g.status.startsWith('Concluído')).length,21);
 assert.equal(d.metrics.delivery_evidence_total,25);
});

test('indicadores: cláusulas citadas e marcos calculados são contados em separado',()=>{
 assert.equal(d.metrics.deadlines_quoted,330);
 assert.equal(d.metrics.deadlines_benchmark,111);
 assert.equal(d.metrics.deadlines_quoted+d.metrics.deadlines_benchmark,d.deadlines.length);
 assert.equal(d.deadlines.filter(x=>x.wording_pt.trim()).length,d.metrics.deadlines_quoted);
});

test('o HTML servido está em português: rótulos de interface traduzidos',()=>{
 requireBuild();
 // O pré-renderizador e a aplicação React têm de usar os mesmos rótulos de core.ts.
 // Se divergirem, o browser mostra português e os motores de busca veem inglês.
 // Verifica-se a POSIÇÃO do rótulo, não a presença da expressão: a redação original
 // do ficheiro de investigação é inglesa por opção e está assinalada como tal no texto.
 const ENGLISH_KIND=/Tipo: (Deliverable|Status benchmark|Appointments? \/ planning|Periodic|Formal extension|Planning|Policy implementation|Acknowledged|Conditional|Contextual|Broader)/;
 for(const g of d.groups){
  const h=readFileSync(`dist/grupos/${g.id}/index.html`,'utf8');
  const body=h.slice(h.indexOf('<body'));
  assert(!ENGLISH_KIND.test(body),`${g.id}: tipo de prazo por traduzir no HTML servido`);
  assert(!/Coordenação: Not specified/.test(body),`${g.id}: coordenação por traduzir`);
  assert(!/— Mandate end</.test(body),`${g.id}: marco por traduzir`);
  assert(!/<div class="legal">Not specified in/.test(body),`${g.id}: participação por traduzir`);
 }
});

test('metadados de partilha: og:image absoluto e com dimensões',()=>{
 requireBuild();
 const h=readFileSync('dist/index.html','utf8');
 const origin=(process.env.SITE_URL||'https://cs0160296-tel.github.io/Grupos-de-Trabalho-PT').replace(/\/$/,'');
 assert(h.includes(`<meta property="og:image" content="${origin}/og-card.png"/>`),'og:image em falta ou relativo');
 assert(h.includes('<meta property="og:image:width" content="1200"/>'));
 assert(h.includes('<meta name="twitter:card" content="summary_large_image"/>'));
 assert(existsSync('dist/og-card.png'),'og-card.png não foi publicado');
});


test('nomes de apresentação: todos normalizados, únicos e usados no HTML servido',()=>{
 assert.equal(d.groups.length,122);
 for(const g of d.groups){
  assert(g.display_name.startsWith('Grupo de Trabalho para'),`${g.id}: nome sem o prefixo normalizado`);
  assert(g.display_name.length<=95,`${g.id}: nome demasiado longo para uma linha`);
  assert(g.name,`${g.id}: designação do diploma perdida`);
 }
 assert.equal(new Set(d.groups.map(g=>g.display_name)).size,122,'Nomes de apresentação duplicados');
});

test('páginas de grupo: simplificadas e sem blocos em inglês',()=>{
 requireBuild();
 // Os cartões de registo original eram integralmente em inglês e foram removidos da
 // interface. O registo completo mantém-se em public/audit-completo.json.
 const removidos=[/Base do prazo e qualificações/,/Notas sobre a designação/,/Disposições numeradas/,/Notas de investigação/,/Pesquisas realizadas/,/Cálculo e qualificação/];
 for(const g of d.groups){
  const h=readFileSync(`dist/grupos/${g.id}/index.html`,'utf8');
  const body=h.slice(h.indexOf('<body'));
  assert(body.includes(g.display_name),`${g.id}: título normalizado ausente`);
  assert(body.includes('Designação no diploma'),`${g.id}: designação oficial deixou de estar visível`);
  for(const rx of removidos) assert(!rx.test(body),`${g.id}: bloco «${rx.source}» ainda presente`);
 }
});


test('revisão de 2026-10-12: aplicada, rastreável e em português',()=>{
 const rev=d.groups.filter(g=>g.audit_reviewed);
 assert.equal(rev.length,36,'A revisão deve cobrir os 36 grupos «Sem informação pública» do retrato anterior');
 assert.equal(d.metrics.audit_status_changes,7);
 assert.equal(d.metrics.audit_output_urls,17);
 for(const g of rev){
  assert.equal(g.audit_date,'2026-10-12',`${g.id}: data da revisão em falta`);
  assert(g.audit_note_pt&&g.audit_note_pt.length>30,`${g.id}: nota da revisão em falta`);
  // O relatório de auditoria é em inglês; o que vai para o site tem de ser português.
  assert(!/\b(the|was|were|report|deadline|group)\b/i.test(g.audit_note_pt),`${g.id}: nota da revisão com texto inglês`);
  if(g.audit_output_url)assert(g.evidence_urls.includes(g.audit_output_url),`${g.id}: URL do resultado fora das fontes`);
 }
 // O corte de evidência do conjunto não se mexe: a revisão é uma camada datada à parte.
 assert.equal(d.cutoff,'2026-10-10');
 assert.equal(new Set(d.groups.map(g=>g.last_checked)).size,1,'O retrato tem de manter um só corte de evidência');
});

test('revisão: os atrasos novos são medidos até ao corte, não até à data da auditoria',()=>{
 const dias=(a,b)=>Math.round((new Date(b)-new Date(a))/86400000);
 for(const id of ['GT-2025-014','GT-2025-037']){
  const g=d.groups.find(x=>x.id===id);
  assert.equal(g.status,'Em atraso');
  assert.equal(g.delay_days,dias(g.deadline_current,d.cutoff),`${id}: atraso não bate com prazo->corte`);
 }
});
