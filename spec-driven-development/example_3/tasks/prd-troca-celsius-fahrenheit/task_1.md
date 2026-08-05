# Tarefa 1.0: Criar a base de conversão de temperatura e o alternador de unidade

## Visão geral

Construir as duas peças isoladas da funcionalidade: o tipo `TemperatureUnit`, o módulo puro que converte, arredonda e formata temperaturas, e o componente controlado `TemperatureUnitToggle`. Nenhum componente existente é alterado nesta tarefa, de modo que a suíte atual permanece verde ao final dela.

<skills>
### Conformidade com skills

- `executar-task`: usar para conduzir a implementação desta tarefa e marcar as subtarefas ao concluí-las.
- `react`: carregar obrigatoriamente antes de criar `TemperatureUnitToggle`, aplicando componente pequeno e controlado, props explícitas sem spread, ausência de estado redundante e de efeito para valor derivado, semântica de `button` com `aria-pressed`, nome acessível, foco visível e estilização por utilitários Tailwind.
- `impeccable`: aplicável apenas como referência visual. O alternador deve seguir a direção registrada em `DESIGN.md` — âmbar como pista de estado ativo, contraste AA e legibilidade a partir de 360 px — sem conduzir uma revisão visual do painel.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`.

- A alteração é exclusiva de `frontend/`; comandos executados dentro desse diretório e nenhum arquivo do backend tocado.
- `folder-structure.md`: o tipo novo fica em `src/types/` com um conceito por arquivo; o módulo de conversão não é acesso ao backend e por isso fica em `src/lib/`, não em `src/services/`; o componente fica em `src/components/` com o teste ao lado.
- `code-standards.md`: arquivos abaixo de 100 linhas, funções abaixo de 30 linhas, no máximo três parâmetros, sem comentários, sem linhas em branco dentro de funções e sem números ou strings mágicos — a fórmula, o fator de conversão e os símbolos ficam em constantes nomeadas do módulo.
- `javascript-typescript.md`: `const` por padrão, comparações estritas, tipagem explícita de parâmetros e retornos, proibição de `any`, ternário simples e sem aninhamento, e nenhuma mutação de argumentos.
- `tests.md`: todo código novo nasce coberto, seguindo FIRST e AAA, com testes rápidos, independentes e autovalidados; a base é unitária e não há dependência externa a substituir por mock nesta tarefa.
- Validação obrigatória do JavaScript/TypeScript: executar `npm run lint` em `frontend/` ao final da tarefa.
- Não há desvio planejado das regras.
</rules>

<requirements>
- Definir `TemperatureUnit` como união literal `'celsius' | 'fahrenheit'`, nomeando a unidade e não o símbolo (RF5).
- Implementar a conversão pela fórmula `fahrenheit = celsius * 9 / 5 + 32`, arredondando somente após converter (RF5).
- Arredondar temperatura ao inteiro mais próximo nas duas unidades, sem casas decimais (RF6).
- Normalizar `-0` para `0`, de modo que a interface nunca exiba `-0°C` (RF6).
- Concatenar o símbolo da unidade ativa sem espaço, produzindo `24°C` e `76°F` (RF7).
- Concentrar em `formatTemperature` a única origem de texto de temperatura da interface (RF5, RF7).
- Expor o alternador como `role="group"` rotulado `Unidade de temperatura`, com dois `<button type="button">` de texto visível `°C` e `°F` (RF1).
- Indicar a unidade ativa por `aria-pressed`, contraste e peso do texto, nunca apenas por cor (RF2).
- Definir nomes acessíveis `Celsius (°C)` e `Fahrenheit (°F)`, contendo o texto visível para cumprir o critério WCAG 2.5.3 (RF14).
- Manter o componente controlado, sem estado próprio, notificando a unidade correspondente ao botão acionado (RF1, RF10).
- Garantir alcance por `Tab`, acionamento por teclado e indicador de foco visível no padrão âmbar já usado no formulário (RF13).
- Permitir acionar a unidade já ativa sem produzir efeito observável (RF4).
- Não introduzir dependência nova, requisição, `useMemo`, contexto ou qualquer forma de persistência (RF9, RF12).
</requirements>

## Subtarefas

- [x] 1.1 Criar `src/types/temperature-unit.ts` com o tipo `TemperatureUnit`.
- [x] 1.2 Criar `src/lib/temperature.ts` com `toFahrenheit`, `getUnitSymbol` e `formatTemperature`, incluindo arredondamento e normalização de zero negativo.
- [x] 1.3 Criar `src/lib/temperature.test.ts` cobrindo fórmula, arredondamento, sinal e símbolo (TU-01 a TU-04).
- [x] 1.4 Criar `src/components/TemperatureUnitToggle.tsx` como componente controlado com semântica acessível e estilo alinhado ao `DESIGN.md`.
- [x] 1.5 Criar `src/components/TemperatureUnitToggle.test.tsx` cobrindo estado ativo, nome acessível, acionamento, teclado e seleção da unidade já ativa (TU-05 a TU-08).
- [x] 1.6 Executar `npm run lint`, `npm run typecheck` e `npm test` em `frontend/` e confirmar que a suíte existente permanece verde.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “Principais interfaces”, “Modelos de dados” — em especial as tabelas `TemperatureUnit`, `TemperatureUnitToggleProps`, “Regras fixas de conversão e formatação” e “Semântica acessível do alternador” —, os itens de “Principais decisões” sobre módulo puro, `aria-pressed` e arredondar depois de converter, e os riscos de zero negativo, WCAG 2.5.3 e formatação duplicada.

## Critérios de aceitação relacionados

- CA-01
- CA-03
- CA-04
- CA-11
- CA-12

## Testes da tarefa

### Testes de unidade

- [x] TU-01 — Converte Celsius para Fahrenheit nos valores especificados
- [x] TU-02 — Arredonda ao inteiro mais próximo nas duas unidades
- [x] TU-03 — Normaliza zero negativo na formatação
- [x] TU-04 — Concatena o símbolo da unidade ativa
- [x] TU-05 — Alternador expõe a unidade ativa por estado e nome acessível
- [x] TU-06 — Alternador notifica a unidade escolhida ao ser acionado
- [x] TU-07 — Alternador é operável por teclado com foco visível
- [x] TU-08 — Selecionar a unidade já ativa mantém a exibição

## Arquivos relevantes

- `frontend/src/types/temperature-unit.ts`
- `frontend/src/lib/temperature.ts`
- `frontend/src/lib/temperature.test.ts`
- `frontend/src/components/TemperatureUnitToggle.tsx`
- `frontend/src/components/TemperatureUnitToggle.test.tsx`
- `DESIGN.md`
- `tasks/prd-troca-celsius-fahrenheit/techspec.md`
