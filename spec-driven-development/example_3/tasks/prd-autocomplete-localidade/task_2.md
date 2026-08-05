# Tarefa 2.0: Implementar o frontend do autocomplete, integração e validação E2E

## Visão geral

Implementar o fluxo completo no frontend React: busca debounced de sugestões, combobox acessível, seleção por ponteiro e teclado, consulta meteorológica estruturada, estados de recuperação e testes E2E para os fluxos críticos.

<skills>
### Conformidade com skills

- `react`: aplicar componentes pequenos, props explícitas, separação entre view, componentes, hooks e services, efeitos somente para sincronização externa, cleanup de requisições, semântica ARIA, foco visível e Tailwind responsivo.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

`AGENTS.md` e todas as rules em `.agents/rules/` foram lidos. Aplicam-se especialmente:

- manter o fluxo `view → components/hooks → services → backend` e não usar `fetch` em views ou componentes;
- manter componentes com responsabilidade única, arquivos TypeScript com até 100 linhas e funções com até 30 linhas;
- declarar props explicitamente, evitar mutação, usar TypeScript estrito, `unknown` nas respostas externas e comparações estritas;
- usar `useEffect` somente para timer, requisição, cancelamento ou outra sincronização externa, sempre com cleanup;
- fornecer papéis, nomes, estados e relações ARIA para o combobox e anunciar carregamento, vazio e erro;
- usar Tailwind CSS com foco, hover, estados condicionais e responsividade sem overflow horizontal;
- criar testes automatizados com Testing Library, `user-event`, fake timers, Vitest e Playwright, mantendo cobertura mínima de 80%.

Não há desvios planejados.
</rules>

<requirements>
- RF1 a RF4: buscar após debounce somente com query válida, atualizar resultados e exibir no máximo cinco opções.
- RF5: exibir cidade, divisão administrativa quando disponível e país em cada sugestão.
- RF6 e RF7: permitir seleção por mouse, toque e teclado; setas navegam, Enter seleciona e Escape fecha.
- RF8 e RF9: fechar a lista e iniciar `POST /weather` com a localidade selecionada, sem escolher silenciosamente uma homônima.
- RF10 a RF13: comunicar loading, vazio e indisponibilidade, manter o campo editável e ignorar respostas obsoletas.
- RF14: fechar a lista ao limpar, selecionar, pressionar Escape ou sair da interação.
- Manter o foco no campo durante a navegação e comunicar o item ativo com `aria-activedescendant`.
- Manter legibilidade e operação em 360 px e 1280 px, sem depender apenas de cor ou ícones.
- Adaptar os mocks e executar as validações de lint, typecheck, build, testes, cobertura e Playwright.
</requirements>

## Subtarefas

- [x] 2.1 Criar os tipos de estado, o cliente de localidades, o cliente meteorológico e os parsers de respostas do frontend.
- [x] 2.2 Implementar `useLocationSuggestions` com debounce de 200 ms, `AbortController`, cleanup, estados discriminados e proteção contra respostas fora de ordem.
- [x] 2.3 Implementar `useComboboxNavigation`, `LocationAutocomplete`, `LocationSuggestionsList` e `LocationSuggestionFeedback` com a semântica acessível definida na TechSpec.
- [x] 2.4 Integrar seleção, pausa da busca e consulta meteorológica na `WeatherView`, removendo `WeatherSearchForm` e preservando o resultado e a atribuição existentes.
- [x] 2.5 Criar testes unitários, de componente e de integração para serviços, hooks, semântica, teclado, ponteiro, feedback e envio estruturado ao clima.
- [x] 2.6 Atualizar o mock da Open-Meteo e criar os testes Playwright para homônimas, teclado, estados vazios e de erro, respostas fora de ordem, p95 e responsividade.
- [x] 2.7 Executar lint, typecheck, build, testes com cobertura mínima de 80% no frontend e a suíte E2E, corrigindo as falhas encontradas.

## Detalhes de implementação

Consultar `techspec.md`, especialmente “Arquitetura do sistema”, “Design de implementação”, “Modelos de dados”, “Pontos de integração”, “Abordagem de testes”, “Sequenciamento do desenvolvimento” e “Conformidade com skills”. Usar a TechSpec como fonte de verdade para a máquina de estados, contratos HTTP, debounce, cancelamento, semântica WAI-ARIA, seleção como pausa da busca, mensagens e comportamento responsivo.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09
- CA-10
- CA-11
- CA-12
- CA-13

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-FE-01 — Interpreta sucesso, vazio e erro de localidades
- [x] TU-FE-02 — Aplica debounce e evita chamada abaixo do mínimo
- [x] TU-FE-03 — Ignora respostas obsoletas
- [x] TU-FE-04 — Expõe a semântica do combobox
- [x] TU-FE-05 — Navega e seleciona por teclado
- [x] TU-FE-06 — Seleciona por ponteiro e fecha a lista
- [x] TU-FE-07 — Envia a seleção estruturada ao clima

### Testes de integração (se aplicável)

- [x] TI-FE-01 — Integra autocomplete, seleção e clima

### Testes E2E (se aplicável)

- [x] E2E-01 — Escolhe uma cidade homônima por ponteiro
- [x] E2E-02 — Opera o combobox somente por teclado
- [x] E2E-03 — Trata mínimo, vazio e indisponibilidade
- [x] E2E-04 — Mantém somente a resposta da query atual
- [x] E2E-05 — Mede o p95 das sugestões
- [x] E2E-06 — Mantém o autocomplete responsivo

## Arquivos relevantes

- `tasks/prd-autocomplete-localidade/prd.md`
- `tasks/prd-autocomplete-localidade/techspec.md`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/LocationAutocomplete.tsx`
- `frontend/src/components/LocationSuggestionsList.tsx`
- `frontend/src/components/LocationSuggestionFeedback.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/hooks/useLocationSuggestions.ts`
- `frontend/src/hooks/useComboboxNavigation.ts`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/location-service.ts`
- `frontend/src/services/weather-service.ts`
- `frontend/src/types/location-suggestion.ts`
- `frontend/src/types/location-search-state.ts`
- `frontend/src/types/api-error.ts`
- Testes `*.test.ts` e `*.test.tsx` próximos aos módulos frontend
- `frontend/vitest.config.ts`
- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
- `e2e/real-performance.spec.ts`
- `e2e/playwright.config.ts`
