# Observatório dos Grupos de Trabalho

Iniciativa independente de transparência, em português europeu. Inventário de registos públicos de grupos constituídos pelo Governo português entre 2 de abril de 2024 e 10 de outubro de 2026. Não é um site oficial nem um censo certificado.


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

O build importa primeiro o Excel, verifica os tipos, compila a aplicação e gera o HTML das rotas. O cartão de partilha `public/og-card.png` é gerado à parte, com `python3 scripts/og-card.py`, e só precisa de ser refeito quando os números do corte mudam. Os testes verificam os invariantes do retrato de 2026, as relações, ligações, pesquisa, filtros, CSV, integridade do Excel e páginas geradas. Para um novo retrato, atualizar os valores esperados dos testes após verificar as alterações nos dados; não ajustar os testes apenas para ocultar divergências.

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

As sugestões são dirigidas aos *issues* deste repositório, configurados em `data/site-config.json`:

```json
{"feedbackEmail":"","githubIssuesUrl":"https://github.com/cs0160296-tel/Grupos-de-Trabalho-PT/issues"}
```

Sem destinatário configurado (ambos os campos vazios) o botão descarrega a sugestão em texto e di-lo explicitamente, em vez de fingir que a enviou.

O email abre um rascunho no programa do visitante, que confirma o envio. Em GitHub, a ligação deve terminar em `/issues` no ficheiro de configuração; abre-se `/issues/new` com título e texto preenchidos, e o visitante confirma a publicação. O site não envia mensagens automaticamente, não conserva os contactos e não simula um backend. Preferir apenas um destino, rever o envio e reconstruir/publicar. Não configurar um endereço fictício.


### Alterações pequenas, diretamente no browser

1. Abrir o ficheiro no GitHub e escolher o lápis (Edit this file). Premir `.` no repositório também abre o editor github.dev.
2. Editar e escolher **Commit changes**. Para revisão conjunta, escolher uma nova branch e abrir um pull request; depois da revisão, fazer Merge.
3. Qualquer commit em `main` inicia **Actions → Check and publish website**. Só um build com verificações aprovadas publica a nova versão. Consultar a execução para confirmar que terminou com sucesso.
4. Abrir https://cs0160296-tel.github.io/Grupos-de-Trabalho-PT/ depois da publicação. Não há necessidade de carregar manualmente `dist/` ou `node_modules/`.

Para textos e layout, editar `src/home.tsx`, `src/pages.tsx` e `src/styles.css`. O Excel em `data/source.xlsx` continua a ser a fonte dos dados investigados; editar os JSON públicos gerados não é uma forma persistente de alterar os dados. Para dados, seguir o procedimento de atualização acima, rever fontes e traduções, e atualizar os testes apenas depois de verificar o novo retrato.

### GitHub Desktop

No computador do Diogo, escolher **File → Clone repository → URL**, indicar o URL do repositório e escolher uma pasta local. Usar Fetch/Pull antes de começar; criar uma branch, editar, Commit, Push e abrir um pull request. O Diogo precisa de aceitar o convite e iniciar sessão na conta GitHub dele.

### Alojamento

O workflow `.github/workflows/publish.yml` instala Node e Python, importa o Excel, constrói as 128 páginas e executa os testes. Commits em `main` publicam no GitHub Pages; pull requests executam as verificações sem publicar. O workflow utiliza a autenticação temporária do GitHub; não requer chaves de API pessoais.

Em **Settings → Pages → Build and deployment → Source**, selecionar **GitHub Actions**. Os caminhos da aplicação, ficheiros e HTML pré-gerado suportam o prefixo `/Grupos-de-Trabalho-PT/`. O build local usa a raiz `/` por omissão. Para outro alojamento, definir `SITE_BASE_PATH` e `SITE_URL` antes do build. A pasta `dist/` é o resultado completo; as rotas têm o seu próprio `index.html`.

A versão inicial em Sites tem publicação separada e não acompanha os commits de GitHub automaticamente. O URL de GitHub Pages é o endereço para o trabalho colaborativo e a publicação automática.

## Verificações e limites

- 122 grupos, 74 XXIV / 48 XXV e 116 atos de criação.
- **Segunda ronda de verificação (12 de outubro de 2026).** Os 36 grupos classificados «Sem informação pública» no retrato de 10 de outubro foram reexaminados: 191 elementos de evidência, 169 prazos reanalisados, 372 pesquisas registadas. Sete mudaram de estado e em 17 foi identificado um resultado público atribuível ao grupo. A revisão é aplicada por `data/revisao-auditoria-2026-10-12.json`, **por cima** do Excel e nunca dentro dele; apagar o ficheiro reverte-a por completo. Cada alteração — campo, valor anterior, valor novo e motivo — fica registada em `data/import-report.json`, no bloco `revisao_auditoria`.
- Os atrasos da revisão foram recalculados até 10 de outubro de 2026, o corte de evidência do conjunto, para que a coluna continue comparável. O relatório de auditoria media-os até 11 de outubro e dois valores estavam um dia acima da sua própria fundamentação.
- 441 registos de prazo, dos quais **330 citam a redação de uma cláusula** do diploma e **111 são marcos de acompanhamento calculados** por esta investigação, sem texto correspondente no ato. Os dois números são publicados em separado; o contador da metodologia mostra apenas as cláusulas citadas.
- Evidência de entrega identificada em **20** grupos. Apenas **2** têm estado «Concluído»: nos restantes **18** a entrega está documentada mas a data não é pública, pelo que a pontualidade não é classificável. **Entrega não comprovada e entrega não datada não são a mesma coisa** — ver `data/import-report.json`, bloco `data_quality`.
- Sete estados, depois da revisão: 2 no prazo, 2 com atraso, 20 em curso, 62 em atraso, 4 prorrogados, 3 extintos/substituídos e 29 sem informação pública. Antes da revisão eram 1 / 1 / 18 / 60 / 4 / 2 / 36.
- Média de atraso entre os registos Em atraso: 369,7 dias; máximo: 888. São valores de acompanhamento ao corte de evidência, não atrasos comprovados de todos os relatórios.
- Os portefólios sobrepõem-se. O gráfico de políticas usa a primeira área indicada e o detalhe conserva todas.
- O ficheiro refere 3.251 URLs globais, mas a cobertura mensal soma 3.142. A diferença de 109 está explicitada na interface; não se inventou uma repartição.
- O filtro de relatórios públicos usa afirmações explícitas do campo de evidência (não considera todo o URL PDF como relatório do grupo). Informação ausente não é prova de inexistência. Evidência parcial é identificada no texto.
- As reservas de investigação e os cálculos originais em inglês são conservados e assinalados como tal; os resumos e a interface estão em pt-PT.
- A acessibilidade foi apoiada por estrutura semântica, foco visível, etiquetas, contraste e redução de movimento, e por inspeção de desktop/telefone. Não equivale a certificação externa WCAG.
- O importador regista em `data/import-report.json` (bloco `data_quality`) as anomalias que detecta no ficheiro de origem sem as corrigir em silêncio. Hoje há **7 prazos com data anterior à publicação do ato que os cria** — linhas da folha `Deadlines` que citam texto que não é uma obrigação de entrega, como a alínea da composição em `GT-2024-003-D01`. Corrigem-se em `data/source.xlsx`, não no código, e os testes pinam a contagem para que não cresça sem ser notada.
- O registo não foi atualizado depois de 10 de outubro de 2026. As fontes externas podem mudar ou deixar de estar acessíveis.

## Licença

- **Código** (`src/`, `scripts/`, configuração, workflows): MIT. Ver [`LICENSE`](LICENSE).
- **Dados** (ficheiro de investigação, JSON derivados, traduções, exportação CSV): CC BY 4.0. Ver [`LICENSE-DATA`](LICENSE-DATA).

Ao reutilizar os dados, indicar a autoria e o corte de evidência. Os estados e os atrasos são um retrato datado e não se atualizam com a passagem do tempo.

O texto dos diplomas é do Diário da República Eletrónico e segue o regime de reutilização da INCM; a licença acima cobre a compilação, a classificação e as anotações desta investigação.
