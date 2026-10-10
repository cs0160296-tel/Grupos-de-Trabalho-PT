# Observatório dos Grupos de Trabalho

Iniciativa independente de transparência, em português europeu. Inventário de registos públicos de grupos constituídos pelo Governo português entre 2 de abril de 2024 e 10 de outubro de 2026. Não é um site oficial nem um censo certificado.

Site publicado: https://observatorio-grupos-de-trabalho.nina-and-tom-9604.chatgpt.site

## Conteúdo e aplicação

React + TypeScript + Vite, TanStack Table e Lucide. Arquitetura estática, sem serviços pagos, base de dados ou autenticação para os visitantes. Gráficos em HTML/CSS com ligações, contagens legíveis, títulos explicativos e nomes acessíveis. Tema claro e escuro, navegação por teclado, tabelas responsivas e formulários etiquetados.

O panorama calcula os indicadores a partir dos registos importados. O explorador combina pesquisa sem distinção de acentos, filtros, ordenação, paginação, colunas opcionais e exportação CSV. Os filtros, a ordenação e a página ficam no URL. Cada um dos 122 grupos tem uma rota estável, cronologia, redação legal integral, composição, evidência e reservas. Metodologia, lacunas e outras estruturas permanecem separadas.

A construção gera 128 páginas HTML indexáveis, incluindo as 122 páginas de grupo, metadados, dados estruturados e sitemap. JavaScript acrescenta as interações. Os conteúdos principais de cada grupo também existem no HTML servido, sem depender da execução de JavaScript.

## Instalar e executar localmente

Requisitos: Node.js 22.18+ (ou 24+), npm e Python 3.10+ com openpyxl. Não são necessárias chaves de API.

```sh
npm ci
python3 -m pip install -r requirements.txt
npm run dev
```

Abrir o endereço local apresentado, normalmente http://127.0.0.1:5173. O ficheiro `public/data.json` já acompanha este projeto. Se necessário, indicar um Python específico com `PYTHON_BIN=/caminho/python3`.

```sh
npm run build
npm test
npm run preview
```

O build importa primeiro o Excel, verifica os tipos, compila a aplicação e gera o HTML das rotas. Os testes verificam os invariantes do retrato de 2026, as relações, ligações, pesquisa, filtros, CSV, integridade do Excel e páginas geradas. Para um novo retrato, atualizar os valores esperados dos testes após verificar as alterações nos dados; não ajustar os testes apenas para ocultar divergências.

## Fonte e atualização dos dados

`data/source.xlsx` é uma cópia inalterada de `portuguese-government-working-groups-2026-10-10.xlsx`. O original da investigação continua na pasta superior. O download público `fonte-original.xlsx` conserva os mesmos bytes. O importador calcula o SHA-256 e valida-o nos testes.

1. Rever as fontes oficiais e os estados no novo ficheiro. A data do browser nunca redefine os estados históricos.
2. Substituir `data/source.xlsx` por uma cópia do novo Excel. Manter as folhas e os cabeçalhos documentados. O importador procura os cabeçalhos nas primeiras 30 linhas; não pressupõe a linha 5.
3. Executar `npm run import:data`. Em alternativa, `npm run import:data -- /caminho/novo.xlsx` importa e guarda uma cópia desse ficheiro em `data/source.xlsx` para os builds seguintes.
4. Rever `data/import-report.json`: contagens, corte de evidência, fontes, integridade e traduções pendentes. O importador falha perante IDs duplicados, fontes de criação em falta, datas inválidas, estados desconhecidos ou relações órfãs. Não omite uma linha só porque um campo opcional está vazio. Um retrato deve ter uma data comum de revisão.
5. Atualizar as traduções editoriais em `data/translations-a.json`, `data/translations-b.json` e `data/transparency-pt.json`. O legal português não é traduzido nem abreviado. As traduções dos grupos só são usadas se a impressão digital dos quatro campos originais coincidir com `data/translation-fingerprints.json`; alterações exigem tradução revista. Sem tradução válida, mostra-se o original inglês, não uma tradução antiga. Atualizar as impressões digitais apenas depois de rever a tradução.
6. Atualizar os testes de retrato, textos específicos do caso do passaporte, as traduções de metodologia/lacunas e os indicadores de exclusão temporal quando o âmbito mudar. Os indicadores numéricos gerais, as relações e as páginas de grupos são regenerados automaticamente. Os textos editoriais do passaporte são deliberadamente datados, não um feed automático.
7. Executar `npm run build` e `npm test`. Inspecionar os gráficos, a pesquisa, os estados, as qualificações e as páginas alteradas. Publicar uma nova versão.

`public/audit-completo.json` conserva todas as nove folhas tabulares e as células da folha Dashboard, incluindo todos os campos e hiperligações. `public/data.json` evita duplicação desses campos na primeira carga, mantendo os conteúdos necessários à interface. O Excel continua a ser a fonte de verdade; não se lêem os antigos ficheiros JSON de investigação para reconstruir o registo.

As datas do Excel são convertidas em ISO, os portefólios e prazos são unidos por ID estável e as estatísticas contam grupos únicos. As datas alternativas, cálculos e qualificações são preservados; o importador não refaz contagens de dias úteis nem inventa uma data para reportes condicionais.

## Correções: estado e configuração

O formulário de cada grupo prepara uma sugestão com ID, tipo, descrição, fonte oficial e contacto opcional. Os dados publicados nunca são alterados por visitantes.

**Ainda não foi indicado um destinatário.** Nesta versão, o botão descarrega uma sugestão em texto ou copia-a; não afirma que foi enviada. Para ativar uma via de envio real, editar `data/site-config.json` com um endereço de receção ou o URL HTTPS da página `/issues` de um repositório GitHub controlado pelo projeto:

```json
{"feedbackEmail":"endereco-real-do-projeto","githubIssuesUrl":""}
```

O email abre um rascunho no programa do visitante, que confirma o envio. Em GitHub, a ligação deve terminar em `/issues` no ficheiro de configuração; abre-se `/issues/new` com título e texto preenchidos, e o visitante confirma a publicação. O site não envia mensagens automaticamente, não conserva os contactos e não simula um backend. Preferir apenas um destino, rever o envio e reconstruir/publicar. Não configurar um endereço fictício.

## Publicação

A pasta `dist/` é o resultado estático completo. Pode ser publicada em Sites, Netlify, Vercel ou qualquer alojamento HTTPS de ficheiros estáticos. Configurar a resolução de caminhos para os ficheiros `index.html` das pastas (por exemplo `/grupos/GT-2024-046/index.html`) e a página 404; o router suporta navegação no cliente. Os dados e downloads usam caminhos absolutos, pelo que a implantação deve estar na raiz do domínio.

Para outro domínio, alterar `origin` em `scripts/prerender.mjs` antes do build; os URLs canónicos e sitemap seguem esse valor. Em Sites, preservar `.openai/hosting.json` e o seu `project_id`; sincronizar e guardar o commit exato antes de publicar. Nenhuma credencial de alojamento acompanha este projeto.

## Verificações e limites

- 122 grupos, 74 XXIV / 48 XXV, 116 atos de criação e 441 registos de prazo.
- Sete estados: 1 no prazo, 1 com atraso, 18 em curso, 60 em atraso, 4 prorrogados, 2 extintos/substituídos e 36 sem informação pública.
- Média de atraso entre os registos Em atraso: 375,2 dias; máximo: 888. São valores de acompanhamento ao corte de evidência, não atrasos comprovados de todos os relatórios.
- Os portefólios sobrepõem-se. O gráfico de políticas usa a primeira área indicada e o detalhe conserva todas.
- O ficheiro refere 3.251 URLs globais, mas a cobertura mensal soma 3.142. A diferença de 109 está explicitada na interface; não se inventou uma repartição.
- O filtro de relatórios públicos usa afirmações explícitas do campo de evidência (não considera todo o URL PDF como relatório do grupo). Informação ausente não é prova de inexistência. Evidência parcial é identificada no texto.
- As reservas de investigação e os cálculos originais em inglês são conservados e assinalados como tal; os resumos e a interface estão em pt-PT.
- A acessibilidade foi apoiada por estrutura semântica, foco visível, etiquetas, contraste e redução de movimento, e por inspeção de desktop/telefone. Não equivale a certificação externa WCAG.
- O registo não foi atualizado depois de 10 de outubro de 2026. As fontes externas podem mudar ou deixar de estar acessíveis.
