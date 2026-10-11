import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {emptyFilters,filterGroups,readFilters,csv,fold,statuses} from '../src/core.ts';
const d=JSON.parse(readFileSync('public/data.json','utf8'));
const audit=JSON.parse(readFileSync('public/audit-completo.json','utf8'));
test('historical snapshot counts and status categories reconcile',()=>{assert.equal(d.cutoff,'2026-10-10');assert.equal(d.groups.length,122);assert.deepEqual(d.metrics.governments,{XXIV:74,XXV:48});assert.deepEqual(statuses.map(s=>d.groups.filter(g=>g.status===s).length),[1,1,18,60,4,2,36]);assert.equal(new Set(d.groups.map(g=>g.url)).size,116);assert.equal(d.metrics.average_delay,375.2);assert.equal(d.metrics.max_delay,888)});
test('IDs, all deadlines, source URLs and one-to-many joins',()=>{const ids=new Set(d.groups.map(g=>g.id));assert.equal(ids.size,122);assert.equal(d.deadlines.length,441);assert.equal(new Set(d.deadlines.map(x=>x.id)).size,441);assert.equal(d.groups.reduce((s,g)=>s+g.deadlines.length,0),441);d.deadlines.forEach(x=>{assert(ids.has(x.group_id));assert(x.source_url.startsWith('https://'))});d.groups.forEach(g=>{assert(g.url.startsWith('https://diariodarepublica.pt/'));assert(g.portfolios.length);assert.equal(new Set(g.portfolios).size,g.portfolios.length);assert(g.mission_pt);assert(g.status_explanation_pt)});assert.equal(Object.keys(audit.sheets).length,9);assert(audit.dashboard_cells.length);assert.equal(audit.sheets.Groups.length,122);assert.equal(audit.sheets.Deadlines.length,441)});
test('passport source, snapshot benchmark and preserved legal wording',()=>{const g=d.groups.find(g=>g.id==='GT-2024-046');assert.equal(g.delay_days,102);assert.equal(g.deadline_current,'2026-06-30');assert.equal(g.url,'https://diariodarepublica.pt/dr/detalhe/despacho/14284-2024-898695314');assert(g.deadlines.some(x=>x.due==='2025-01-16'));assert(g.objective_pt.includes('passaporte'));assert(g.policy_pt.includes('cinco'));assert.equal(g.last_checked,'2026-10-10')});
test('accent-insensitive search and combined URL filters',()=>{assert.equal(fold('JUSTIÇA'),'justica');assert.equal(filterGroups(d.groups,{...emptyFilters,q:'passaporte'}).length,1);assert.deepEqual(filterGroups(d.groups,{...emptyFilters,q:'justica'}).map(g=>g.id),filterGroups(d.groups,{...emptyFilters,q:'justiça'}).map(g=>g.id));const f=readFilters(new URLSearchParams('government=XXV&status=Em+atraso&status=Sem+informa%C3%A7%C3%A3o+p%C3%BAblica'));assert.equal(filterGroups(d.groups,f).length,32);assert.equal(filterGroups(d.groups,{...emptyFilters,government:'XXIV'}).length,74);assert.equal(filterGroups(d.groups,{...emptyFilters,status:['Em atraso']}).length,60);assert.equal(filterGroups(d.groups,{...emptyFilters,month:'2024-12'}).length,6);assert.equal(filterGroups(d.groups,{...emptyFilters,q:'termoinexistenteabcdef'}).length,0)});
test('CSV contains only filtered rows, escaped values and source columns',()=>{const groups=filterGroups(d.groups,{...emptyFilters,q:'passaporte'});const out=csv(groups);assert(out.startsWith('\uFEFF'));assert(out.includes('GT-2024-046'));assert(!out.includes('GT-2024-001'));assert(out.includes('https://diariodarepublica.pt/dr/detalhe/despacho/14284-2024-898695314'));assert(out.includes('2026-10-10'));assert(csv([{...groups[0],name:'Nome "citado"'}]).includes('Nome ""citado""'))});
test('coverage distinction, immutable source workbook and translations',()=>{assert.equal(d.metrics.screened_urls,3251);assert.equal(d.metrics.monthly_allocated_urls,3142);assert.equal(d.sheets.Coverage.length,31);assert.equal(d.sheets['Act review'].length,292);assert.equal(d.sheets['Discovery gaps'].length,9);assert.equal(d.sheets['Related bodies'].length,15);const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');assert.equal(hash('data/source.xlsx'),hash('public/fonte-original.xlsx'));assert.equal(hash('data/source.xlsx'),d.source.sha256)});
test('built route files cover every group with source, title and legal text',()=>{if(!existsSync('dist/sitemap.xml'))return;d.groups.forEach(g=>{const h=readFileSync(`dist/grupos/${g.id}/index.html`,'utf8');assert(h.includes(g.id));assert(h.includes(g.url));assert(h.includes('<title>'));assert(h.includes('application/ld+json'));assert(h.includes('Missão e objetivos'))})});

test('deployment paths include the configured base and keep every route and download reachable',()=>{
 if(!existsSync('dist/sitemap.xml'))return;
 const base=(process.env.SITE_BASE_PATH||'/').replace(/\/$/,'');
 const origin=(process.env.SITE_URL||'https://observatorio-grupos-de-trabalho.nina-and-tom-9604.chatgpt.site').replace(/\/$/,'');
 for(const route of ['', '/explorar','/grupos/GT-2024-046']){
  const h=readFileSync(`dist${route}/index.html`,'utf8');
  for(const [,url] of h.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g))assert(url.startsWith(base+'/'),`Wrong deployment path: ${url}`);
  assert(h.includes(`href="${base}/explorar"`));
  assert(h.includes(`href="${origin}${route||'/'}"`));
 }
 assert(readFileSync('dist/sitemap.xml','utf8').includes(origin+'/grupos/GT-2024-046'));
 assert(existsSync('dist/.nojekyll'));
});
