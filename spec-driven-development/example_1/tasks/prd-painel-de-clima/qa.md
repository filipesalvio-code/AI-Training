# Relatório de QA — Painel de clima

As evidências da ferramenta de navegador estão salvas em `tasks/prd-painel-de-clima/evidences/`.

## Resumo

- Data: 2026-08-02
- Status: APROVADO
- Total de critérios de aceitação: 13
- Critérios de aceitação atendidos: 13
- Bugs encontrados: 0
- Ambiente determinístico: mock Open-Meteo `3050`, backend `3001`, frontend `5101`
- Rodada real: backend `3003`, frontend `5102`, Open-Meteo de produção

## Critérios de aceitação verificados

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Busca válida exibe as condições atuais da primeira localidade | TU-BE-03, TU-BE-05, TU-FE-03, TI-BE-01, TI-FE-01, E2E-01 | PASSOU | [manual-success.png](evidences/manual-success.png) |
| CA-02 | Usa a primeira localidade sem seleção intermediária e identifica a localização | TU-BE-03, TU-BE-04, TU-FE-03, TI-BE-01, E2E-01 | PASSOU | [success.png](evidences/success.png) |
| CA-03 | Exibe temperatura, sensação, condição, umidade e vento em pt-BR e unidades métricas | TU-BE-05, TU-BE-06, TU-FE-03, TI-BE-01, E2E-01 | PASSOU | [manual-success.png](evidences/manual-success.png) |
| CA-04 | Navegador consulta somente o backend, sem chamada direta à Open-Meteo | E2E-02 | PASSOU | E2E confirmou apenas `127.0.0.1:3001/weather` |
| CA-05 | Entrada inválida recebe orientação e não gera busca meteorológica | TU-BE-02, TU-FE-01, TI-BE-02, TI-FE-01, E2E-03 | PASSOU | [manual-validation-error.png](evidences/manual-validation-error.png) |
| CA-06 | Cidade não encontrada informa o problema e permite nova tentativa | TU-FE-04, TI-BE-03, TI-FE-01, E2E-04 | PASSOU | [manual-not-found.png](evidences/manual-not-found.png) |
| CA-07 | Indisponibilidade exibe erro acionável, remove resultado anterior e permite retry | TU-BE-07, TU-BE-08, TU-FE-05, TI-BE-04, TI-FE-01, E2E-05 | PASSOU | [unavailable-error.png](evidences/unavailable-error.png) |
| CA-08 | Loading é perceptível e submissões duplicadas são bloqueadas | TU-FE-02, TI-FE-01, E2E-06 | PASSOU | [manual-loading.png](evidences/manual-loading.png) |
| CA-09 | Pelo menos 95% das consultas concluem em até 3 segundos | TU-BE-08, E2E-09 | PASSOU | [controlled-performance.json](evidences/controlled-performance.json), [real-performance.json](evidences/real-performance.json) |
| CA-10 | Fluxo completo funciona por teclado com foco lógico e visível | TU-FE-06, E2E-07 | PASSOU | E2E-07 passou; foco `:focus-visible` conferido no botão |
| CA-11 | Estados e mensagens são identificáveis e anunciáveis | TU-FE-06, TI-FE-01, E2E-07 | PASSOU | [manual-validation-error.png](evidences/manual-validation-error.png), [manual-loading.png](evidences/manual-loading.png) |
| CA-12 | Layout permanece legível e operável em 360 px e 1280 px sem overflow | E2E-08 | PASSOU | [manual-responsive-360.png](evidences/manual-responsive-360.png), [manual-responsive-1280.png](evidences/manual-responsive-1280.png) |
| CA-13 | Atribuição à Open-Meteo e licença ficam visíveis com links funcionais | TU-FE-03, E2E-01 | PASSOU | [manual-success.png](evidences/manual-success.png) |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 | Pesquisa e exibição do resultado completo | PASSOU | Localidade, cinco condições, unidades e atribuição verificadas |
| E2E-02 | Isolamento de rede do navegador | PASSOU | Nenhuma requisição para host Open-Meteo; backend recebeu `/weather` |
| E2E-03 | Validação de entrada inválida | PASSOU | Zero requisições meteorológicas; `aria-invalid` e `aria-describedby` presentes |
| E2E-04 | Recuperação de cidade não encontrada | PASSOU | Nova busca válida concluída após erro |
| E2E-05 | Limpeza de sucesso após indisponibilidade e retry | PASSOU | Resultado anterior removido e retry concluído |
| E2E-06 | Loading e submissão duplicada | PASSOU | Uma requisição; botão desabilitado durante espera |
| E2E-07 | Teclado e anúncios acessíveis | PASSOU | Enter, região de status e resultado acessíveis |
| E2E-08 | Responsividade em 360 px e 1280 px | PASSOU | Sem overflow horizontal |
| E2E-09 | Desempenho fim a fim controlado | PASSOU | 20 amostras, p95 de 63 ms |

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|-------------|
| Backend | TU-BE-01 a TU-BE-08 | PASSOU | `cd backend && npm test` | 46 testes passaram |
| Backend | TI-BE-01 a TI-BE-05 | PASSOU | `cd backend && npm test` | Contratos HTTP e health check verificados |
| Frontend | TU-FE-01 a TU-FE-06 | PASSOU | `cd frontend && npm test` | 14 testes passaram |
| Frontend | TI-FE-01 | PASSOU | `cd frontend && npm test` | Quatro estados integrados verificados |
| E2E | E2E-01 a E2E-09 | PASSOU | `cd e2e && npm test` | 9 testes passaram |
| Frontend | — | PASSOU | `npm run lint`, `npm run typecheck`, `npm run build` | 0 erros; warnings não bloqueantes já existentes |
| Backend | — | PASSOU | `npm run build` | Build concluído |

- Cobertura frontend: 96,52% statements, 89,69% branches, 100% functions, 100% lines; meta mínima 80% atendida.
- Cobertura backend: 94,78% statements, 92,06% branches, 96,61% functions, 95,49% lines; meta mínima 80% atendida.
- Desempenho controlado: 20 amostras, p95 de 63 ms, aprovado.
- Desempenho real: 20 cidades em regiões e idiomas distintos, p95 de 812 ms, aprovado; detalhes em `real-performance.json`.

## Acessibilidade

- [x] Navegação por teclado com Tab e Enter verificada; foco visível via `:focus-visible`.
- [x] Elementos interativos possuem nomes acessíveis e os links têm nomes descritivos.
- [x] Não há imagens de conteúdo na tela; portanto, não há imagem sem `alt` aplicável.
- [x] Contraste e foco visual conferidos na tela desktop e no viewport de 360 px.
- [x] Campo possui `<label>` associado por `for="city"`/`id="city"`.
- [x] Mensagem de validação é clara, usa `role="alert"`, `aria-invalid` e `aria-describedby`.
- [x] Loading usa `role="status"`, `aria-live` e `aria-busy`; sucesso possui região semântica.
- [x] Textos e controles permanecem legíveis a partir de 360 px.
- [x] Documento usa `lang="pt-BR"` e título coerente.
- [x] Console do navegador: 0 erros e 0 warnings da aplicação durante a inspeção.

## Bugs encontrados e corrigidos

Nenhum bug foi encontrado nesta execução. Não houve alteração de código nem necessidade de teste de regressão adicional.

## Conclusão

O painel de clima atende todos os 13 critérios de aceitação. As suítes unitária, integração e E2E passaram, as metas de cobertura foram atingidas, a rodada real de desempenho apresentou p95 de 812 ms e as verificações manuais de acessibilidade, rede e responsividade foram aprovadas. QA **APROVADO**.
