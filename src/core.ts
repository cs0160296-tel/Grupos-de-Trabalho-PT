import type {Group} from './model';
export const statuses=['Concluído no prazo','Concluído com atraso','Em curso – dentro do prazo','Em atraso','Prorrogado','Extinto / substituído','Sem informação pública'];
export const statusInfo:Record<string,{color:string;explanation:string}>= {
 'Concluído no prazo':{color:'done',explanation:'Evidência pública permite confirmar a entrega dentro do prazo aplicável.'},
 'Concluído com atraso':{color:'late-done',explanation:'A entrega está confirmada e ocorreu depois do prazo usado no registo. Consultar a obrigação e a data de referência.'},
 'Em curso – dentro do prazo':{color:'ongoing',explanation:'O prazo usado na revisão de evidência ainda não tinha terminado.'},
 'Em atraso':{color:'overdue',explanation:'O prazo ou marco de acompanhamento passou e a pesquisa não encontrou confirmação pública da entrega. Isto não prova que os trabalhos não tenham sido entregues.'},
 'Prorrogado':{color:'extended',explanation:'Há uma prorrogação formal relevante. A data revista ou a falta de uma data determinável é indicada no registo.'},
 'Extinto / substituído':{color:'extinct',explanation:'Uma fonte oficial confirma a extinção ou substituição do grupo.'},
 'Sem informação pública':{color:'unknown',explanation:'A PONTUALIDADE não pode ser verificada: pode faltar um prazo, a data de início ou a data de receção, ou existir informação contraditória. Atenção: este estado NÃO significa que nada se sabe sobre o grupo — em parte destes registos a entrega está documentada em fonte oficial, mas sem data que permita classificar o cumprimento do prazo. Ver a metodologia.'}
};
export const number=(n:number,d=0)=>new Intl.NumberFormat('pt-PT',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n);
export const date=(x:string|null|undefined,full=false)=>x?new Intl.DateTimeFormat('pt-PT',{day:'numeric',month:full?'long':'short',year:'numeric',timeZone:'UTC'}).format(new Date(x+'T12:00:00Z')):'Não determinada';
export const fold=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const words:Record<string,string>={'Transport':'Transportes','Economy':'Economia','EU funds':'Fundos europeus','Health':'Saúde','Energy':'Energia','Social protection':'Proteção social','Environment':'Ambiente','Water':'Água','Buildings':'Edifícios','Culture':'Cultura','Education':'Educação','Childcare':'Infância','Raw materials':'Matérias-primas','Equality':'Igualdade','Domestic violence':'Violência doméstica','Digital':'Digital','Cybersecurity':'Cibersegurança','Children':'Crianças','State reform':'Reforma do Estado','Justice':'Justiça','Intellectual property':'Propriedade intelectual','Internal administration':'Administração interna','Borders':'Fronteiras','Air quality':'Qualidade do ar','Homelessness':'Pessoas sem-abrigo','Disability':'Deficiência','Civil protection':'Proteção civil','Youth':'Juventude','Migration':'Migrações','Nature':'Natureza','Infrastructure':'Infraestruturas','Labour':'Trabalho','Waste':'Resíduos','Identity':'Identidade','Finance':'Finanças','State enterprises':'Empresas públicas','Tax':'Fiscalidade','Customs':'Alfândegas','Training':'Formação','Pensions':'Pensões','Ocean':'Oceano','Foundations':'Fundações','Coast':'Litoral','Science':'Ciência','Forests':'Florestas','Defence':'Defesa','Ports':'Portos','Housing':'Habitação','Construction':'Construção','Space':'Espaço','Higher education':'Ensino superior','Data':'Dados','Agriculture':'Agricultura','Local government':'Poder local','Geology':'Geologia','Regional government':'Governos regionais','Human trafficking':'Tráfico de pessoas','Regional development':'Desenvolvimento regional','Rail':'Ferrovia'};
export const areaLabel=(s:string)=>s.split(' / ').map(p=>words[p]||p).join(' / ');
const portfolioNames:Record<string,string>={'Presidency / Council of Ministers':'Presidência / Conselho de Ministros','Education / Science':'Educação / Ciência','Environment / Energy':'Ambiente / Energia','Labour / Social security':'Trabalho / Segurança Social','Internal affairs':'Administração Interna','Agriculture / Fisheries / Sea':'Agricultura / Pescas / Mar','Infrastructure / Housing':'Infraestruturas / Habitação','Territorial cohesion':'Coesão Territorial','Foreign affairs':'Negócios Estrangeiros','Youth / Sport':'Juventude / Desporto','Youth / Modernisation':'Juventude / Modernização'};
export const portfolioLabel=(s:string)=>portfolioNames[s]||areaLabel(s);
export const kindLabel=(s:string)=>({'Periodic / conditional':'Obrigação periódica ou condicional','Appointment / planning':'Designação ou planeamento','Appointments / planning':'Designação ou planeamento','Periodic':'Obrigação periódica','Periodic / mandate':'Reporte periódico ou mandato','Planning':'Planeamento','Acknowledged extension':'Prorrogação reconhecida em fonte posterior','Acknowledged later instruction':'Instrução posterior reconhecida','Conditional illustration':'Cálculo ilustrativo condicionado','Status benchmark':'Referência para o estado do grupo','Formal extension':'Prorrogação formal','Policy implementation window':'Janela de execução da política','Deliverable / duration':'Entrega ou duração','Contextual programme window':'Janela do programa — contexto','Broader act context':'Contexto do diploma'}[s]||s);
export const paymentLabel=(s:string)=>({'unpaid':'Não remunerada','paid':'Remunerada','terms':'Condições específicas','unknown':'Não especificada'}[s]||s);
/* Rótulos partilhados pela aplicação React e pelo pré-renderizador. Ambos têm de usar
   estas funções: o HTML servido é o que os motores de busca e as pré-visualizações leem. */
export const coordinatorLabel=(s:string)=>s.startsWith('Not specified')?'Não especificada na disposição de criação.':s;
export const participationLabel=(s:string)=>s.startsWith('Not specified')?'Não especificada no ato de criação.':s;
export const milestoneLabel=(kind:string,label:string)=>kind==='Status benchmark'?'Referência de acompanhamento do grupo':kind==='Formal extension'?'Prorrogação formal':label;
export type Filters={q:string;government:string;status:string[];portfolio:string;area:string;from:string;to:string;dueFrom:string;dueTo:string;payment:string;evidence:string;extension:string;overdue:string;report:string;month:string};
export const emptyFilters:Filters={q:'',government:'',status:[],portfolio:'',area:'',from:'',to:'',dueFrom:'',dueTo:'',payment:'',evidence:'',extension:'',overdue:'',report:'',month:''};
export function readFilters(p:URLSearchParams):Filters{return {...emptyFilters,...Object.fromEntries(Object.keys(emptyFilters).filter(k=>k!=='status').map(k=>[k,p.get(k)||''])),status:p.getAll('status')};}
export function filterGroups(groups:Group[],f:Filters){return groups.filter(g=>{
 if(f.q&&!fold([g.id,g.name,g.act,g.issuer,g.coordinator,g.members,g.mission_pt,g.mission_en,g.objective_pt,g.specific_objectives,...g.portfolios.map(portfolioLabel)].join(' ')).includes(fold(f.q)))return false;
 if(f.government&&g.government!==f.government)return false;
 if(f.status.length&&!f.status.includes(g.status))return false;
 if(f.portfolio&&!g.portfolios.includes(f.portfolio))return false;
 if(f.area&&g.area.split(' / ')[0]!==f.area&&g.area!==f.area)return false;
 if(f.from&&(!g.published||g.published<f.from))return false;
 if(f.to&&(!g.published||g.published>f.to))return false;
 if(f.month&&!g.published.startsWith(f.month))return false;
 if(f.dueFrom&&(!g.deadline_current||g.deadline_current<f.dueFrom))return false;
 if(f.dueTo&&(!g.deadline_current||g.deadline_current>f.dueTo))return false;
 if(f.payment&&g.payment!==f.payment)return false;
 if(f.evidence&&g.has_delivery_evidence!==(f.evidence==='yes'))return false;
 if(f.extension&&g.has_extension!==(f.extension==='yes'))return false;
 if(f.overdue&&((g.status==='Em atraso')!==(f.overdue==='yes')))return false;
 if(f.report&&g.report_public!==(f.report==='yes'))return false;
 return true;
});}
export function csv(groups:Group[]){const headers=['ID','Grupo de trabalho','Governo','Áreas governativas','Área de política pública','Publicação','Prazo original','Prazo atual','Estado','Dias de atraso','Data de revisão','Diploma','URL Diário da República','Missão','Evidência do estado','Entrega dos trabalhos','Implementação das medidas'];return '\uFEFF'+[headers,...groups.map(g=>[g.id,g.name,g.government,g.portfolios.map(portfolioLabel).join('; '),areaLabel(g.area),g.published,g.deadline_original,g.deadline_current,g.status,g.delay_days,g.last_checked,g.act,g.url,g.mission_pt,g.status_explanation_pt,g.delivery_pt,g.policy_pt])].map(row=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');}
export const groupUrl=(id:string)=>'/grupos/'+id;
export const extractUrls=(text:string)=>Array.from(new Set(text.match(/https?:\/\/[^\s<>]+/g)||[]));
