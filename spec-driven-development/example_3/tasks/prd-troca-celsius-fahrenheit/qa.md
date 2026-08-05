# Relatório de QA — Troca entre Celsius e Fahrenheit

As evidências da ferramenta de navegador estão salvas em `tasks/prd-troca-celsius-fahrenheit/evidences/`.

## Resumo

- Data: 2026-08-05
- Status: APROVADO
- Total de critérios de aceitação: 13
- Critérios de aceitação atendidos: 13
- Bugs encontrados: 1, corrigido
- Revalidação independente: concluída com sucesso em 2026-08-05

## Ambiente de validação

- Ferramenta de navegador: Playwright Chromium.
- Frontend: `http://127.0.0.1:5100`.
- Backend: `http://127.0.0.1:3000`.
- Mock Open-Meteo: `http://127.0.0.1:3070`.
- Encerramento: os processos iniciados pela rodada foram finalizados; processos de outra worktree não foram interrompidos.

## Critérios de aceitação verificados

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
| --- | --- | --- | --- | --- |
| CA-01 | Converte e exibe temperatura em Fahrenheit | TU-02, TU-06, TU-09, E2E-10 | PASSOU | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-02 | Mantém sensação térmica na unidade ativa | TU-04, TU-09, E2E-10 | PASSOU | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-03 | Aplica a fórmula e o arredondamento corretos | TU-01, TU-02 | PASSOU | Testes Vitest |
| CA-04 | Expõe estado e nomes acessíveis no alternador | TU-05, E2E-10 | PASSOU | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-05 | Troca sem requisição adicional | TI-02, E2E-10 | PASSOU | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-06 | Troca sem estado de carregamento | TI-02, E2E-10 | PASSOU | Testes Vitest e Playwright |
| CA-07 | Preserva unidade entre buscas | TI-03, E2E-10 | PASSOU | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-08 | Retorna a Celsius após recarregar | TI-04, E2E-10 | PASSOU | Teste Playwright |
| CA-09 | Mantém umidade e vento em unidades métricas | TU-10 | PASSOU | [Fahrenheit](evidences/e2e-10-fahrenheit.png) |
| CA-10 | Oculta alternador fora do resultado | TI-01 | PASSOU | [Inicial 360 px](evidences/e2e-08-initial-360.png) |
| CA-11 | Opera por teclado com foco e rótulos | TU-07, E2E-07, E2E-10 | PASSOU | Teste Playwright |
| CA-12 | Reaplicar unidade ativa não altera leitura | TU-08 | PASSOU | Teste Vitest |
| CA-13 | Mantém controle legível em 360 px e 1280 px | TU-11, E2E-08 | PASSOU | [360 px](evidences/e2e-08-360.png), [1280 px](evidences/e2e-08-1280.png) |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
| --- | --- | --- | --- |
| E2E-01 | Pesquisa e resultado completo | PASSOU | Valores arredondados em Celsius |
| E2E-02 | Sem chamada direta à Open-Meteo | PASSOU | Navegador usa somente o backend |
| E2E-03 | Validação sem requisição | PASSOU | [Evidência](evidences/e2e-03-validation.png) |
| E2E-04 | Recuperação de cidade não encontrada | PASSOU | Retry bem-sucedido |
| E2E-05 | Erro externo e retry | PASSOU | [Evidência](evidences/e2e-05-external-error.png) |
| E2E-06 | Loading e bloqueio de duplicidade | PASSOU | Mock lento controlado |
| E2E-07 | Navegação e acionamento por teclado | PASSOU | Loading determinístico |
| E2E-08 | Layout em 360 px e 1280 px | PASSOU | Sem overflow horizontal |
| E2E-09 | Orçamento controlado | PASSOU | p95 dentro de 3 s |
| E2E-10 | Troca, preservação e recarregamento | PASSOU | Sem requisição na troca |

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
| --- | --- | --- | --- | --- |
| Unidade/Integração | TU-01 a TU-11, TI-01 a TI-04 | PASSOU | `npm test` | 24 testes passaram |
| Cobertura | — | PASSOU | `npm run test:coverage` | 97,08% statements, 90,32% branches |
| Qualidade | — | PASSOU | `npm run lint`, `npm run typecheck`, `npm run build` | Lint sem erros; 4 avisos preexistentes |
| E2E | E2E-01 a E2E-10 | PASSOU | `npm test` em `e2e/` | 10 passaram; performance real foi ignorado por configuração |

- Cobertura: 97,08% de statements, acima da meta de 80%.

## Acessibilidade

- [x] Navegação por teclado: `Tab` e `Enter` verificados em E2E-07 e E2E-10.
- [x] Elementos interativos com rótulos descritivos: botões Celsius e Fahrenheit possuem nomes acessíveis e `aria-pressed`.
- [x] Imagens: não há imagens informativas na tela.
- [x] Contraste: estado ativo em âmbar e inativo em branco sobre slate; verificado visualmente.
- [x] Formulário: campo de cidade possui rótulo associado.
- [x] Erros: validação e indisponibilidade usam alerta acessível.
- [x] Fontes: leitura conferida em 360 px e 1280 px.

## Bugs encontrados e corrigidos

| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-01 | E2E-07 verificava um loading que podia desaparecer antes da asserção com resposta imediata. | Baixa | Corrigido | Usa a cidade controlada `Lento`, cuja resposta mantém o estado visível. | E2E-07 | Saída Playwright aprovada |

## Conclusão

A funcionalidade atende aos 13 critérios de aceitação. A troca ocorre localmente, mantém a preferência durante a sessão de página, retorna a Celsius em uma nova carga e permanece acessível e responsiva.
