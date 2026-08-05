# Tarefa 2.0: Integrar a troca de unidade ao painel e validar fim a fim

## Visão geral

Ligar a base criada na tarefa 1 ao painel: `WeatherResult` passa a formatar temperatura e sensação térmica pela unidade selecionada e a renderizar o alternador, e `WeatherView` passa a manter essa unidade em estado de componente. Esta tarefa concentra a mudança de arredondamento e, com ela, a atualização dos testes existentes que hoje afirmam valores com casa decimal, além do caso E2E novo e das validações finais.

<skills>
### Conformidade com skills

- `executar-task`: usar para conduzir a implementação desta tarefa, que depende da conclusão da tarefa 1.
- `react`: carregar obrigatoriamente antes de alterar `WeatherResult` e `WeatherView`, aplicando estado elevado ao menor ancestral comum, props explícitas sem spread, ausência de `useEffect` para valor derivado, ausência de memoização prematura e preservação da semântica acessível já existente.
- `executar-qa`: usar na validação final e na estabilização contra PRD, TechSpec e tarefas, registrando as evidências em `tasks/prd-troca-celsius-fahrenheit/evidences/`.
- `impeccable`: aplicável apenas como referência visual, garantindo que o alternador junto ao valor em destaque preserve a hierarquia, o contraste e a responsividade descritos em `DESIGN.md`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`.

- A alteração é exclusiva de `frontend/` e `e2e/`; nenhum arquivo do backend é tocado e nenhum `package.json` é criado na raiz.
- `folder-structure.md`: o fluxo `view → components` é preservado; o estado da unidade vive na view e desce por props, e o resultado continua sem acesso HTTP.
- `code-standards.md`: arquivos abaixo de 100 linhas, funções e componentes abaixo de 30 linhas, no máximo três parâmetros, sem comentários e sem linhas em branco dentro de funções, mantendo o estilo denso já praticado nos componentes existentes.
- `javascript-typescript.md`: tipagem explícita das props, `const` por padrão, comparações estritas, proibição de `any` e nenhuma mutação do payload recebido do backend.
- `tests.md`: manter a pirâmide com base unitária ampla, quatro casos de integração e um único caso E2E; testes independentes, repetíveis e autovalidados; cobertura mínima de 80% respeitada; seletores por papéis e nomes acessíveis, sem acoplamento a classes de estilo.
- Os testes E2E permanecem em `e2e/`, fora de `frontend/` e `backend/`.
- Validações obrigatórias ao final: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` em `frontend/`, além da suíte de `e2e/`.
- Não há desvio planejado das regras.
</rules>

<requirements>
- Alterar `WeatherResult` para receber `unit` e `onUnitChange` e formatar temperatura e sensação térmica exclusivamente por `formatTemperature` (RF5, RF6, RF7).
- Derivar o símbolo exibido da unidade selecionada, deixando de usar `units.temperature` e `units.apparentTemperature` do payload na exibição (RF7).
- Manter umidade relativa em `%` e velocidade do vento em `km/h` em qualquer unidade de temperatura, preservando também localidade, condição e atribuição (RF8).
- Renderizar o alternador junto ao valor em destaque, dentro do bloco de resultado, de modo que ele não exista nos estados inicial, de carregamento e de erro (RF1, RF3).
- Manter a unidade em `useState` na `WeatherView`, iniciando sempre em `celsius` e sobrevivendo às consultas seguintes da mesma sessão de página (RF10, RF11).
- Não gravar a preferência em `localStorage`, `sessionStorage`, cookies ou backend (RF12).
- Garantir que a troca não dispare requisição, não altere o contrato da API e não exiba estado de carregamento (RF9).
- Atualizar `WeatherResult.test.tsx` e o caso `E2E-01` para os valores arredondados `24°C` e `25°C`, mantendo `72%` e `12.4km/h` inalterados.
- Estender `E2E-08` para capturar a evidência de 360 px e 1280 px com o alternador visível, sem criar um caso E2E adicional.
- Adicionar `E2E-10` verificando troca por teclado, ausência de requisição a `/weather?city=`, permanência da escolha em nova busca e retorno a Celsius após `reload`.
- Registrar em `tasks/prd-troca-celsius-fahrenheit/evidences/` a captura do resultado em Fahrenheit e as capturas de 360 px e 1280 px.
- Concluir com todas as validações de `frontend/` e `e2e/` passando e a cobertura mínima de 80% mantida.
</requirements>

## Subtarefas

- [x] 2.1 Alterar `src/components/WeatherResult.tsx` para receber a unidade, formatar pelo módulo puro e renderizar o alternador junto ao valor em destaque.
- [x] 2.2 Atualizar `src/components/WeatherResult.test.tsx` para o arredondamento inteiro e adicionar a cobertura de exibição em Fahrenheit e de medidas métricas preservadas (TU-09 a TU-11).
- [x] 2.3 Alterar `src/views/WeatherView.tsx` para manter a unidade em estado e repassá-la ao resultado.
- [x] 2.4 Estender `src/views/WeatherView.test.tsx` com os quatro casos de integração de ausência do controle, isolamento de rede, permanência entre buscas e retorno ao padrão (TI-01 a TI-04).
- [x] 2.5 Atualizar `E2E-01` para os valores arredondados e estender `E2E-08` para registrar a evidência com o alternador visível.
- [x] 2.6 Implementar `E2E-10` em `e2e/weather-panel.spec.ts` e salvar a evidência do resultado em Fahrenheit.
- [x] 2.7 Executar `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` em `frontend/`, e a suíte de `e2e/` com backend e mock ativos.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “Visão dos componentes”, “Mapeamento `WeatherResponse` → exibição”, `WeatherResultProps`, a nota sobre seleção da unidade já ativa, “Abordagem de testes” com os casos TU-09 a TU-11, TI-01 a TI-04 e E2E-10, “Sequenciamento do desenvolvimento” — em que a atualização dos testes existentes é bloqueador da alteração do componente — e os riscos sobre mudança de arredondamento, ordem de foco e formatação duplicada. Os valores de referência do mock `e2e/mock-open-meteo.mjs` são `24.3 °C` e `25.1 °C`, exibidos como `24°C`/`25°C` em Celsius e `76°F`/`77°F` em Fahrenheit.

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

### Testes de unidade

- [x] TU-09 — Resultado exibe temperatura e sensação térmica na unidade escolhida
- [x] TU-10 — Resultado mantém umidade e vento métricos em Fahrenheit
- [x] TU-11 — Resultado em Celsius exibe a leitura completa arredondada

### Testes de integração

- [x] TI-01 — Alternador ausente sem resultado visível
- [x] TI-02 — Troca de unidade não dispara requisição e preserva o resultado
- [x] TI-03 — Unidade escolhida permanece na busca seguinte
- [x] TI-04 — Nova montagem da view começa em Celsius

### Testes E2E

- [x] E2E-10 — Alterna a unidade sem rede, preserva a escolha entre buscas e volta a Celsius após recarregar

## Arquivos relevantes

- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/WeatherResult.test.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/views/WeatherView.test.tsx`
- `e2e/weather-panel.spec.ts`
- `e2e/mock-open-meteo.mjs` (referência, sem alteração)
- `tasks/prd-troca-celsius-fahrenheit/evidences/`
- `tasks/prd-troca-celsius-fahrenheit/techspec.md`
