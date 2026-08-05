# Relatório de QA — Troca de idioma

As evidências de navegador estão em `tasks/prd-troca-de-idioma/evidences/`.

## Resumo

- Data: 2026-08-05
- Status: APROVADO
- Total de critérios de aceitação: 17
- Critérios de aceitação atendidos: 17
- Bugs encontrados: 0

## Critérios de aceitação verificados

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|---|---|---|---|---|
| CA-01 | Alternador visível e acionado em um clique | E2E-10 | PASSOU | `evidences/initial-en-360.png` |
| CA-02 | Tela inicial traduzida | TU-FE-10, E2E-11 | PASSOU | `evidences/initial-en-360.png` |
| CA-03 | Resultado preservado e traduzido | TI-FE-11, E2E-12 | PASSOU | `evidences/result-en-360.png` |
| CA-04 | Condições WMO em inglês | TU-BE-13, TU-FE-11, E2E-12 | PASSOU | `evidences/result-en-360.png` |
| CA-05 | Validação traduzida | TI-FE-13, E2E-15 | PASSOU | `evidences/validation-en.png` |
| CA-06 | Erros estáveis e recuperáveis | TI-BE-12, TI-FE-13, E2E-15 | PASSOU | `evidences/validation-en.png` |
| CA-07 | Texto digitado preservado | TI-FE-12, E2E-14 | PASSOU | `evidences/initial-en-360.png` |
| CA-08 | Consulta em andamento preservada | TI-FE-14, E2E-16 | PASSOU | `evidences/validation-en.png` |
| CA-09 | Unidades e formato numérico local | TU-FE-13, E2E-12 | PASSOU | `evidences/result-en-360.png` |
| CA-10 | Localização e país localizados/degradados | TU-BE-10 a TU-BE-12, TU-FE-14 a TU-FE-15, E2E-12 | PASSOU | `evidences/result-en-360.png` |
| CA-11 | Troca sem rede em até 300 ms | E2E-13 | PASSOU | `evidences/initial-en-360.png` |
| CA-12 | Idioma e título do documento sincronizados | TU-FE-18, E2E-17 | PASSOU | `evidences/initial-en-360.png` |
| CA-13 | Alternador operável por teclado | E2E-18, E2E-07 | PASSOU | `evidences/initial-en-360.png` |
| CA-14 | Nome acessível e rótulos traduzidos | TU-FE-19, E2E-18 | PASSOU | `evidences/initial-en-360.png` |
| CA-15 | pt-BR restaurado ao recarregar | E2E-19 | PASSOU | `evidences/initial-en-360.png` |
| CA-16 | Layout responsivo em 360 px e 1280 px | E2E-20, E2E-08 | PASSOU | `evidences/initial-en-360.png`, `evidences/initial-en-1280.png` |
| CA-17 | Busca em inglês usa apenas o backend | E2E-21, E2E-02, E2E-09 | PASSOU | `evidences/result-en-360.png` |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
|---|---|---|---|
| E2E-01 a E2E-09 | Painel de clima e regressão | PASSOU | 9 cenários determinísticos aprovados. |
| E2E-10 a E2E-21 | Troca de idioma | PASSOU | Alternador, traduções, estado, documento, responsividade e `lang=en` aprovados. |
| Real E2E-09 | p95 com provedores reais | NÃO APLICÁVEL | Requer `QA_REAL=1`; cenário corretamente ignorado. |

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
|---|---|---|---|---|
| Backend | TU-BE-10 a TI-BE-12 | PASSOU | `npm run build`, `npm test`, `npm run test:coverage` | 27 testes aprovados. |
| Frontend | TU-FE-10 a TI-FE-14 | PASSOU | `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, `npm run test:coverage` | 15 testes aprovados; lint sem erros. |
| E2E | E2E-01 a E2E-21 | PASSOU | `npm test` em `e2e/` | 11 cenários aprovados e 1 ignorado por configuração. |

- Cobertura backend: statements 94,23%, branches 91,86%, functions 97,36%, lines 97,18%.
- Cobertura frontend: statements 96,85%, branches 90,00%, functions 100,00%, lines 97,32%.
- Meta mínima de 80% atendida nas duas aplicações.

## Acessibilidade

- [x] Navegação por teclado: `Tab` alcança alternador, campo e botão; `Enter` alterna o idioma.
- [x] Elementos interativos: alternador possui nome acessível com idioma atual e destino; botão e campo têm nomes visíveis.
- [x] Imagens: não há imagens de conteúdo nesta tela.
- [x] Contraste: inspeção visual dos estados em tema escuro confirmou texto e controles legíveis.
- [x] Formulário: `label` associado ao campo de cidade e `aria-invalid` na validação.
- [x] Mensagens: carregamento usa `role=status` e erro/validação usam `role=alert`.
- [x] Tipografia: leitura preservada em 360 px e 1280 px, sem rolagem horizontal.

## Bugs encontrados e corrigidos

Nenhum bug foi encontrado durante esta execução.

## Conclusão

QA APROVADO. Os 17 critérios de aceitação do PRD foram verificados, os testes automatizados e E2E passaram, as coberturas excedem 80% e as evidências visuais foram registradas.
