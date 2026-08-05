# Relatório de QA — Autocomplete de localidades

Evidências visuais: [`evidences/`](./evidences/)

## Resumo

- Data: 2026-08-05
- Status: APROVADO
- Total de critérios de aceitação: 13
- Critérios atendidos: 13
- Bugs de produto: 0

A validação foi executada com frontend, backend e mock da Open-Meteo isolados nas portas 5101, 3001 e 3071. O processo preexistente na porta 3000 foi preservado.

## Critérios de aceitação verificados

| ID | Critério | Casos executados | Status | Evidência |
| --- | --- | --- | --- | --- |
| CA-01 | Busca válida apresenta até cinco sugestões | Springfield; `GET /locations` 200 | PASSOU | [`qa-02-suggestions.png`](./evidences/qa-02-suggestions.png) |
| CA-02 | Vazio, espaços ou menos de dois caracteres não iniciam busca | `a`, espaços e campo vazio | PASSOU | Snapshot sem lista; E2E-03 |
| CA-03 | Sugestão identifica cidade, região e país | Springfield/Illinois e Springfield/Massachusetts | PASSOU | [`qa-02-suggestions.png`](./evidences/qa-02-suggestions.png) |
| CA-04 | Homônima escolhida consulta clima da opção exata | Seleção de Massachusetts; corpo do POST com latitude `42.1` e longitude `-72.6` | PASSOU | [`qa-03-selected-massachusetts.png`](./evidences/qa-03-selected-massachusetts.png) |
| CA-05 | Seleção por ponteiro fecha a lista e consulta clima | Clique na segunda homônima | PASSOU | E2E-01; [`qa-03-selected-massachusetts.png`](./evidences/qa-03-selected-massachusetts.png) |
| CA-06 | Setas, Enter e Escape operam o combobox | ArrowDown, Enter e Escape | PASSOU | [`qa-04-keyboard-active.png`](./evidences/qa-04-keyboard-active.png) |
| CA-07 | Loading é percebido sem perder o texto | Busca `velho`; `aria-busy=true`; valor preservado | PASSOU | [`qa-07-loading.png`](./evidences/qa-07-loading.png) |
| CA-08 | Busca sem resultados informa estado vazio e mantém edição | Busca `Atlantis` | PASSOU | [`qa-05-empty.png`](./evidences/qa-05-empty.png) |
| CA-09 | Indisponibilidade informa erro e permite nova tentativa | `indisponivel` seguido de edição para `indisponivelx` | PASSOU | [`qa-06-unavailable.png`](./evidences/qa-06-unavailable.png) |
| CA-10 | Respostas obsoletas não substituem a query atual | `velho` atrasada seguida de `novo` | PASSOU | [`qa-08-stale-response.png`](./evidences/qa-08-stale-response.png) |
| CA-11 | Pelo menos 95% das buscas aparecem em até 500 ms | E2E-05; medição manual de 10 amostras: p95 216 ms | PASSOU | E2E-05 |
| CA-12 | Combobox e estados são identificáveis por tecnologia assistiva | Roles, nomes, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-busy`, `listbox`, `option`, status e alerta | PASSOU | Snapshot de acessibilidade; [`qa-04-keyboard-active.png`](./evidences/qa-04-keyboard-active.png) |
| CA-13 | Lista permanece legível em 360 px e 1280 px sem overflow | Viewports 360x800 e 1280x900; `scrollWidth` igual à largura da viewport | PASSOU | [`qa-10-responsive-360-suggestions.png`](./evidences/qa-10-responsive-360-suggestions.png), [`qa-11-responsive-1280.png`](./evidences/qa-11-responsive-1280.png) |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
| --- | --- | --- | --- |
| E2E-01 | Homônima por ponteiro | PASSOU | Resultado correto para Massachusetts |
| E2E-02 | Combobox somente por teclado | PASSOU | Foco e item ativo preservados |
| E2E-03 | Mínimo, vazio e indisponibilidade | PASSOU | Edição permite nova tentativa |
| E2E-04 | Resposta fora de ordem | PASSOU | Sugestões antigas descartadas |
| E2E-05 | p95 das sugestões | PASSOU | 20 amostras no teste determinístico; limite de 500 ms atendido |
| E2E-06 | Responsividade | PASSOU | 360 px e 1280 px sem rolagem horizontal |

Comando oficial: `cd e2e && npm test` — 6 testes passaram e 1 teste opcional de provedor real foi pulado.

A rodada opcional `QA_REAL=1 npx playwright test real-performance.spec.ts` também passou com os serviços locais isolados. Ela não representa medição contra a infraestrutura externa real da Open-Meteo.

## Testes automatizados e cobertura

| Camada | Resultado | Comando | Observações |
| --- | --- | --- | --- |
| Backend | 30 testes, 8 arquivos | `cd backend && npm test` | PASSOU |
| Backend | 93.71% statements, 90.47% branches, 98.07% functions, 97.71% lines | `cd backend && npm run test:coverage` | PASSOU; acima de 80% |
| Backend | Build TypeScript | `cd backend && npm run build` | PASSOU |
| Frontend | 18 testes, 8 arquivos | `cd frontend && npm test` | PASSOU |
| Frontend | 96.56% statements, 87.19% branches, 100% functions, 98.90% lines | `cd frontend && npm run test:coverage` | PASSOU; acima de 80% |
| Frontend | Lint | `cd frontend && npm run lint` | PASSOU; 0 erros e 4 avisos não bloqueantes (3 gerados pelo coverage e 1 preexistente em `button.tsx`) |
| Frontend | TypeScript | `cd frontend && npm run typecheck` | PASSOU |
| Frontend | Build de produção | `cd frontend && npm run build` | PASSOU |

## Acessibilidade

O snapshot de acessibilidade confirmou:

- campo `combobox` nomeado “Nome da cidade”;
- `aria-autocomplete="list"`, `aria-controls="location-suggestions"` e `aria-expanded` coerentes;
- `aria-activedescendant="location-suggestions-option-0"` após ArrowDown;
- `listbox` nomeado “Sugestões de localidades” e opções com `role="option"`;
- estado vazio em `status` e indisponibilidade em `alert`;
- foco mantido no campo durante navegação, seleção e Escape.

Não foram observadas exceções JavaScript da aplicação. O navegador registrou o 503 esperado durante o caso de indisponibilidade e um 404 de favicon ausente, observação não relacionada ao fluxo de autocomplete.

## Bugs encontrados e corrigidos

Nenhum bug de produto foi encontrado.

Durante a QA, foi corrigida uma asserção ambígua no teste opcional de performance real: a busca por heading sem correspondência exata fazia “Lima” também corresponder a “Clima de agora”. O teste agora usa `exact: true` em `e2e/real-performance.spec.ts`.

## Conclusão

Os 13 critérios de aceitação foram verificados e atendidos. A funcionalidade está aprovada para encerramento da QA.
