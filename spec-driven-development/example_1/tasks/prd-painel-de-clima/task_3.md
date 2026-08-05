# Tarefa 3.0: Implementar o serviço HTTP e a máquina de estados do frontend

## Visão geral

Preparar a camada de integração do frontend com o backend e implementar uma única fonte de verdade para os estados `idle`, `loading`, `success` e `error`, incluindo validação imediata, prevenção de submissões duplicadas e recuperação após falhas.

<skills>
### Conformidade com skills

- `executar-task`: usar para implementar esta tarefa depois da conclusão da tarefa 2.
- `react`: carregamento obrigatório antes de criar ou alterar o hook, os testes React e qualquer integração do frontend; seguir integralmente suas regras e referências.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`.

- Executar dependências e comandos dentro de `frontend/` e preservar seu lockfile independente.
- Manter o fluxo `view → components/hooks → services → backend`; somente o serviço pode conhecer a URL e o contrato HTTP.
- Usar tipos explícitos em arquivos próprios, nunca `any`, e validar dados externos antes de tratá-los como contratos internos.
- Manter estado mínimo e não redundante, atualizações imutáveis e efeitos apenas para sincronização ou limpeza de fronteiras externas.
- Ignorar respostas obsoletas após desmontagem e não atualizar estado de componente desmontado.
- Cobrir todo código com Vitest e Testing Library, usando comportamento observável e dependências controladas.
- Executar lint, typecheck, build, testes e cobertura antes de concluir a tarefa.
- Não há desvio planejado das regras.
</rules>

<requirements>
- RF2: validar no frontend a mesma regra de cidade do backend, orientar o usuário e não iniciar requisição inválida.
- RF7: usar exclusivamente `GET /weather` no backend, sem qualquer conhecimento ou chamada aos domínios da Open-Meteo.
- RF13: representar o carregamento e impedir que uma segunda submissão inicie outra consulta enquanto a atual estiver pendente.
- RF14 e RF15: mapear cidade não encontrada e indisponibilidade para mensagens acionáveis e permitir nova tentativa.
- RF16: limpar o resultado anterior ao iniciar uma busca e mantê-lo ausente quando a nova tentativa falhar.
- Configurar `VITE_API_BASE_URL` por ambiente, documentá-la em `.env.example` e evitar URL específica de ambiente fixa no código.
- Encapsular o contrato HTTP, o parsing do envelope de erro e o uso de `AbortSignal` em `weather-service.ts`.
- Manter uma máquina de estados discriminada para impedir combinações contraditórias de resultado, carregamento e erro.
- Configurar Vitest, jsdom, Testing Library, `user-event`, `jest-dom`, cobertura V8 e os scripts de teste do frontend.
</requirements>

## Subtarefas

- [x] 3.1 Adicionar as dependências de teste do frontend, atualizar o lockfile e configurar ambiente, setup, scripts e limiares de cobertura.
- [x] 3.2 Definir em arquivos próprios os tipos da resposta, do erro e do estado discriminado da busca.
- [x] 3.3 Implementar o serviço HTTP como única fronteira de acesso a `GET /weather`.
- [x] 3.4 Implementar `useWeatherSearch` com validação, transições de estado, bloqueio de duplicidade, limpeza do resultado e cancelamento seguro.
- [x] 3.5 Implementar os quatro casos unitários previstos usando um harness mínimo e consultas por semântica acessível quando houver UI de teste.
- [x] 3.6 Executar lint, typecheck, build, testes e cobertura do frontend.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “Visão dos componentes”, “Principais interfaces”, `WeatherResponse`, `ApiError`, “Abordagem de testes”, “Sequenciamento do desenvolvimento” e as decisões sobre validação nos dois lados. A composição visual do painel permanece para a tarefa 4.

## Critérios de aceitação relacionados

- CA-05
- CA-06
- CA-07
- CA-08

## Testes da tarefa

### Testes de unidade

- [x] TU-FE-01 — Valida a cidade antes de chamar o serviço
- [x] TU-FE-02 — Modela carregamento e bloqueia submissão duplicada
- [x] TU-FE-04 — Apresenta cidade não encontrada e permite nova tentativa
- [x] TU-FE-05 — Limpa resultado anterior após falha externa

## Arquivos relevantes

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vite.config.ts`
- `frontend/vitest.config.ts`
- `frontend/.env.example`
- `frontend/src/test/setup.ts`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/weather-service.ts`
- `frontend/src/types/weather-response.ts`
- `frontend/src/types/api-error.ts`
- `frontend/src/types/weather-search-state.ts`
- Testes `*.test.ts` e `*.test.tsx` próximos aos módulos correspondentes
