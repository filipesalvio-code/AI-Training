# Tarefa 4.0: Construir a interface acessível e responsiva do painel

## Visão geral

Substituir o indicador de saúde do frontend pela experiência completa de consulta meteorológica, compondo formulário, feedback assíncrono, resultado e atribuição com semântica acessível, linguagem pt-BR e layout operável desde 360 px.

<skills>
### Conformidade com skills

- `executar-task`: usar para implementar esta tarefa depois da conclusão da tarefa 3.
- `react`: carregamento obrigatório antes de qualquer alteração nos componentes, view, hooks, integração, acessibilidade, Tailwind ou testes React.
- `impeccable`: aplicável à composição visual, hierarquia, responsividade, estados, UX copy e acabamento acessível do painel; usar sem contrariar o PRD, a TechSpec ou a skill `react`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`.

- Manter componentes pequenos e com responsabilidade única; views apenas compõem componentes e coordenam o hook.
- Não acessar o backend diretamente em componentes ou views e não duplicar a lógica do serviço.
- Usar HTML semântico, rótulos programáticos, nomes acessíveis, regiões vivas e foco visível.
- Testar pelo comportamento percebido e por papéis e nomes acessíveis, sem acoplamento a classes CSS.
- Usar Tailwind para estilos locais e limitar `index.css` a tokens e estilos base necessários.
- Respeitar arquivos `.ts`/`.tsx` de até 100 linhas, funções e componentes de até 30 linhas e props explicitamente tipadas.
- Não inserir comentários no código salvo necessidade excepcional e não adicionar dependências de UI desnecessárias.
- Executar lint, typecheck, build, testes e cobertura antes de concluir a tarefa.
- Não há desvio planejado das regras.
</rules>

<requirements>
- RF1: oferecer campo textual rotulado e ação clara para enviar a busca por cidade.
- RF4: apresentar cidade, divisão administrativa quando disponível e país da localidade resolvida.
- RF9 a RF12: exibir os cinco dados meteorológicos com rótulos em português e as unidades devolvidas pelo contrato.
- RF13: apresentar carregamento perceptível e refletir o bloqueio da ação durante a consulta.
- RF14 a RF16: apresentar validação, ausência de cidade e indisponibilidade sem dados contraditórios, mantendo o campo editável para nova tentativa.
- RF17: exibir atribuição visível à Open-Meteo e links funcionais da fonte e da licença junto ao resultado.
- Tornar carregamento, sucesso, validação e erro identificáveis e anunciáveis sem depender somente de cor ou ícones.
- Garantir ordem de foco lógica, submissão por teclado, foco visível e associações com `aria-invalid`, `aria-describedby`, `role=status/alert` e `aria-busy` conforme o estado.
- Manter o conteúdo legível e operável a partir de 360 px e em 1280 px, sem overflow horizontal causado pela funcionalidade.
- Definir `lang="pt-BR"`, título coerente e textos de interface em português do Brasil.
- Remover do frontend o polling e o indicador de `/health`; o endpoint continuará existindo apenas no backend.
</requirements>

## Subtarefas

- [x] 4.1 Criar formulário, feedback, resultado e atribuição como componentes independentes e tipados.
- [x] 4.2 Criar `WeatherView` para compor os componentes e consumir exclusivamente `useWeatherSearch`.
- [x] 4.3 Atualizar `App`, documento HTML e estilos para substituir o health check e entregar a hierarquia visual responsiva.
- [x] 4.4 Implementar o teste unitário do resultado completo e da atribuição.
- [x] 4.5 Implementar o teste unitário da semântica acessível dos estados.
- [x] 4.6 Implementar o teste de integração dos quatro estados entre serviço, hook e componentes.
- [x] 4.7 Executar lint, typecheck, build, testes e cobertura do frontend.

## Detalhes de implementação

Seguir `techspec.md`, principalmente os componentes do frontend em “Visão dos componentes”, os modelos `WeatherLocation`, `CurrentConditions`, `WeatherUnits` e `SourceAttribution`, “Experiência do usuário” no PRD, “Testes de unidade”, “Testes de integração” e as decisões de contrato pronto para exibição e remoção do indicador de saúde.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-05
- CA-06
- CA-07
- CA-08
- CA-10
- CA-11
- CA-12
- CA-13

## Testes da tarefa

### Testes de unidade

- [ ] TU-FE-03 — Apresenta sucesso completo e atribuição
- [ ] TU-FE-06 — Expõe estados assíncronos por semântica acessível

### Testes de integração

- [ ] TI-FE-01 — Integra hook, serviço e componentes nos quatro estados

## Arquivos relevantes

- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/index.html`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/components/WeatherFeedback.tsx`
- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/SourceAttribution.tsx`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/weather-service.ts`
- Testes `*.test.tsx` próximos aos componentes e à view
