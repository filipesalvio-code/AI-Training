# Especificação técnica

## Resumo

A funcionalidade descrita em [`prd.md`](./prd.md) será implementada inteiramente no frontend, como uma preferência de apresentação. O backend, o contrato `GET /weather` e o tipo `WeatherResponse` permanecem inalterados: o payload continua em graus Celsius e a conversão acontece no momento da renderização. Um módulo puro converterá e formatará valores de temperatura, um componente novo exporá o alternador `°C`/`°F` e a `WeatherView` manterá a unidade escolhida em estado de componente, o que a preserva entre buscas e a descarta no recarregamento da página, atendendo CA-07 e CA-08 sem qualquer forma de persistência.

Duas decisões alteram comportamento existente e foram confirmadas com o usuário. Primeira: a temperatura e a sensação térmica passarão a ser exibidas arredondadas ao inteiro nas duas unidades, conforme RF6 e CA-03, substituindo a exibição atual com casa decimal — isso exige atualizar `WeatherResult.test.tsx` e o caso `E2E-01`. Segunda: o símbolo exibido passa a derivar da unidade selecionada, e não mais do campo `units.temperature` do payload, que continua governando apenas `%` e `km/h`. Nenhuma dependência nova será adicionada, nenhuma requisição adicional será feita e nenhum arquivo do backend será tocado.

## Arquitetura do sistema

### Visão dos componentes

Fluxo principal:

```text
WeatherView (estado da unidade)
  → WeatherResult (weather, unit, onUnitChange)
    → TemperatureUnitToggle (unit, onUnitChange)
    → formatTemperature(celsius, unit)  [módulo puro, sem React]
```

Componentes novos no frontend:

- `src/types/temperature-unit.ts` — definirá `TemperatureUnit`, mantendo um tipo por arquivo conforme a estrutura de pastas do projeto.
- `src/lib/temperature.ts` — módulo puro, sem React e sem I/O, responsável pela conversão, pelo arredondamento e pela formatação com símbolo.
- `src/components/TemperatureUnitToggle.tsx` — grupo rotulado com dois botões que expõem a unidade ativa por `aria-pressed`.

Componentes modificados no frontend:

- `src/views/WeatherView.tsx` — passará a manter `unit` em `useState` e a repassá-lo ao resultado. É a fronteira correta porque a view sobrevive a trocas de busca, enquanto o resultado é recriado a cada consulta.
- `src/components/WeatherResult.tsx` — receberá `unit` e `onUnitChange`, formatará temperatura e sensação térmica pelo módulo puro e renderizará o alternador junto ao valor em destaque.

Relações e limites:

- O módulo `lib/temperature.ts` não importa React, componentes ou serviços; é chamado apenas pela camada de apresentação.
- `TemperatureUnitToggle` é controlado: não possui estado próprio e apenas notifica a escolha.
- `WeatherResult` continua sem acesso HTTP; o alternador vive dentro dele porque RF3 exige que só exista quando há resultado.
- `useWeatherSearch` e `weather-service` não são alterados: a unidade não participa da requisição, o que garante CA-05 por construção.
- Nenhum componente lê ou grava `localStorage`, `sessionStorage` ou cookies, conforme RF12.

## Design de implementação

### Principais interfaces

```text
temperature (módulo puro)
  toFahrenheit(celsius) -> number
  formatTemperature(celsius, unit) -> string
  getUnitSymbol(unit) -> '°C' | '°F'
```

```text
TemperatureUnitToggle
  props: { unit, onUnitChange }

WeatherResult
  props: { weather, unit, onUnitChange }
```

`formatTemperature` é a única função autorizada a produzir texto de temperatura na interface. Ela converte quando a unidade for `fahrenheit`, arredonda ao inteiro mais próximo, normaliza `-0` para `0` e concatena o símbolo sem espaço, preservando o padrão visual atual (`24°C`). O cálculo é trivial e não será memoizado.

### Modelos de dados

Não há entidade persistida nem alteração de contrato HTTP. Os modelos abaixo descrevem o tipo novo, as props dos componentes afetados e as regras determinísticas de conversão e formatação.

#### `TemperatureUnit` — unidade de exibição selecionada

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `TemperatureUnit` | `'celsius' \| 'fahrenheit'` | sim | União literal usada em toda a camada de apresentação. O valor inicial é sempre `'celsius'`. |

```text
"celsius"
```

> **Escolha do domínio:** o tipo nomeia a unidade (`celsius`), não o símbolo (`°C`), para separar a preferência do usuário do texto exibido e evitar acoplar comparações a caracteres de apresentação.

#### `TemperatureUnitToggleProps` — contrato do alternador

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `unit` | `TemperatureUnit` | sim | Unidade ativa, refletida em `aria-pressed`. |
| `onUnitChange` | `(unit: TemperatureUnit) => void` | sim | Notifica a unidade correspondente ao botão acionado. |

```text
{
  "unit": "celsius",
  "onUnitChange": "(unit) => void"
}
```

#### `WeatherResultProps` — contrato do resultado

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `weather` | `WeatherResponse` | sim | Payload existente do backend, sempre em graus Celsius. |
| `unit` | `TemperatureUnit` | sim | Unidade aplicada a temperatura e sensação térmica. |
| `onUnitChange` | `(unit: TemperatureUnit) => void` | sim | Encaminhado ao alternador. |

```text
{
  "weather": "WeatherResponse",
  "unit": "fahrenheit",
  "onUnitChange": "(unit) => void"
}
```

#### Mapeamento `WeatherResponse` → exibição

| Origem (payload em °C) | Destino (exibição) | Regra |
| --- | --- | --- |
| `current.temperature` | valor em destaque | `formatTemperature(valor, unit)` |
| `current.apparentTemperature` | linha “Sensação térmica” | `formatTemperature(valor, unit)` |
| `units.temperature` | — | Não é mais usado na exibição; o símbolo vem de `unit`. |
| `units.apparentTemperature` | — | Não é mais usado na exibição; o símbolo vem de `unit`. |
| `current.relativeHumidity` + `units.relativeHumidity` | linha “Umidade relativa” | Inalterado, sempre `%`. |
| `current.windSpeed` + `units.windSpeed` | linha “Velocidade do vento” | Inalterado, sempre `km/h`. |
| `current.condition`, `location.*`, `source.*` | inalterados | A troca de unidade não os afeta. |

#### Regras fixas de conversão e formatação

| Regra | Definição |
| --- | --- |
| Fórmula | `fahrenheit = celsius * 9 / 5 + 32` |
| Arredondamento | `Math.round` sobre o valor já convertido, nunca sobre o valor original |
| Meia unidade | `Math.round` aproxima para cima (`-17.5` → `-17`) |
| Zero negativo | `-0` é normalizado para `0`, evitando exibir `-0°C` |
| Símbolo | `celsius` → `°C`; `fahrenheit` → `°F`, concatenado sem espaço |
| Casas decimais | Nenhuma, nas duas unidades |

Exemplos verificáveis, incluindo os valores usados pelo mock de E2E:

| Origem (°C) | Exibição em °C | Exibição em °F |
| --- | --- | --- |
| `0` | `0°C` | `32°F` |
| `23` | `23°C` | `73°F` |
| `-5` | `-5°C` | `23°F` |
| `24.3` | `24°C` | `76°F` |
| `25.1` | `25°C` | `77°F` |
| `-0.4` | `0°C` | `32°F` |

#### Semântica acessível do alternador

| Elemento | Definição |
| --- | --- |
| Contêiner | `role="group"` com `aria-label="Unidade de temperatura"` |
| Botões | Dois `<button type="button">`, texto visível `°C` e `°F` |
| Nome acessível | `aria-label="Celsius (°C)"` e `aria-label="Fahrenheit (°F)"`, contendo o texto visível para cumprir o critério WCAG 2.5.3 (Label in Name) |
| Estado | `aria-pressed={true}` no botão da unidade ativa e `false` no outro |
| Foco | Anel de foco visível reutilizando o padrão âmbar já usado no formulário |
| Indicação visual | Contraste de fundo e peso do texto, além de `aria-pressed`; a cor nunca é o único indicador |

> **Seleção da unidade já ativa:** o botão permanece acionável e chama `onUnitChange` com o mesmo valor. `useState` do React descarta a atualização quando o valor é idêntico, de modo que nenhum valor exibido muda, satisfazendo RF4 e CA-12 sem lógica condicional adicional.

Não há esquema de banco de dados, cache ou armazenamento local. A preferência existe apenas na memória do componente enquanto a página estiver aberta.

### Endpoints da API (se aplicável)

Não aplicável. A funcionalidade não expõe, altera ou consome endpoint novo. `GET /weather` e `GET /health` permanecem exatamente como especificados na [TechSpec do painel de clima](../prd-painel-de-clima/techspec.md), e nenhuma requisição é disparada pela troca de unidade.

## Pontos de integração

Não aplicável. Não há integração externa nova, autenticação nova ou tratamento de erro novo. A Open-Meteo continua sendo consultada apenas pelo backend durante a busca, e a conversão local não introduz modos de falha: o módulo puro opera sobre números já validados pelo backend e presentes no estado de sucesso.

## Abordagem de testes

Vitest cobrirá a unidade e a integração no frontend, com os limiares de 80% já configurados em `frontend/vitest.config.ts`. Playwright cobrirá um único fluxo E2E, conforme decidido com o usuário. Os testes consultarão papéis e nomes acessíveis, sem acoplamento a classes de estilo, e seguirão FIRST e AAA. Nenhum teste desta funcionalidade precisa de rede: o módulo é puro e a troca de unidade não faz requisições.

Além dos casos novos, dois testes existentes serão atualizados por causa da mudança de arredondamento: `WeatherResult.test.tsx`, que hoje afirma `24.3°C` e `25.1°C`, e `E2E-01`, que afirma os mesmos valores contra o mock. Após a atualização, ambos passam a afirmar `24°C` e `25°C`, e as demais medidas (`72%` e `12.4km/h`) permanecem inalteradas.

### Testes de unidade (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-01 | Converte Celsius para Fahrenheit nos valores especificados | CA-03 | `0`, `23` e `-5` produzem `32°F`, `73°F` e `23°F`. |
| TU-02 | Arredonda ao inteiro mais próximo nas duas unidades | CA-01, CA-03 | `24.3` produz `24°C` e `76°F`; `25.1` produz `25°C` e `77°F`. |
| TU-03 | Normaliza zero negativo na formatação | CA-01 | `-0.4` produz `0°C`, e nunca `-0°C`. |
| TU-04 | Concatena o símbolo da unidade ativa | CA-01, CA-02 | A saída termina em `°C` ou `°F` conforme a unidade recebida, sem espaço. |
| TU-05 | Alternador expõe a unidade ativa por estado e nome acessível | CA-04 | O botão da unidade ativa tem `aria-pressed="true"`, o outro `false`, e ambos têm nome acessível contendo o símbolo visível. |
| TU-06 | Alternador notifica a unidade escolhida ao ser acionado | CA-01 | Acionar `°F` chama `onUnitChange` com `'fahrenheit'`. |
| TU-07 | Alternador é operável por teclado com foco visível | CA-11 | O grupo é alcançável por `Tab` e a ativação por teclado dispara a troca. |
| TU-08 | Selecionar a unidade já ativa mantém a exibição | CA-12 | Nenhum valor exibido muda após acionar novamente a unidade ativa. |
| TU-09 | Resultado exibe temperatura e sensação térmica na unidade escolhida | CA-01, CA-02 | Com `unit='fahrenheit'`, ambos os valores aparecem em `°F` e nenhum valor em `°C` permanece visível. |
| TU-10 | Resultado mantém umidade e vento métricos em Fahrenheit | CA-09 | `72%` e `12.4km/h` continuam visíveis com `unit='fahrenheit'`. |
| TU-11 | Resultado em Celsius exibe a leitura completa arredondada | CA-01, CA-13 | Regressão do componente existente: `24°C`, `25°C`, `72%`, `12.4km/h` e os links de atribuição permanecem visíveis. |

O módulo `lib/temperature.ts` será testado isoladamente, sem renderização, cobrindo fórmula, arredondamento, sinal e símbolo. `TemperatureUnitToggle` e `WeatherResult` serão testados com Testing Library e `user-event`. Não há dependência externa a substituir por mock nesta camada.

### Testes de integração (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-01 | Alternador ausente sem resultado visível | CA-10 | Nos estados inicial, de carregamento e de erro, o grupo `Unidade de temperatura` não existe no documento. |
| TI-02 | Troca de unidade não dispara requisição e preserva o resultado | CA-05, CA-06 | Após um sucesso, acionar `°F` não incrementa as chamadas de `fetch`, mantém localidade, condição e atribuição e não exibe estado de carregamento. |
| TI-03 | Unidade escolhida permanece na busca seguinte | CA-07 | Com `°F` ativo, uma nova consulta bem-sucedida é exibida em Fahrenheit sem nova interação com o alternador. |
| TI-04 | Nova montagem da view começa em Celsius | CA-08 | Uma nova renderização da `WeatherView` exibe o resultado em `°C` com `°C` marcado como ativo. |

Os testes de integração renderizarão a `WeatherView` completa e substituirão apenas `fetch` na fronteira do serviço, seguindo o padrão já adotado em `WeatherView.test.tsx`. TI-04 verifica o comportamento equivalente ao recarregamento da página, que em ambiente de teste corresponde a uma montagem nova sem estado preservado.

### Testes E2E (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-10 | Alterna a unidade sem rede, preserva a escolha entre buscas e volta a Celsius após recarregar | CA-05, CA-07, CA-08, CA-11 | Após uma consulta, acionar `°F` por teclado exibe `76°F` e `77°F` sem nenhuma requisição a `/weather?city=`; uma nova consulta permanece em Fahrenheit; após `reload`, uma consulta volta a exibir `24°C`. |

O caso reutilizará o mock em `e2e/mock-open-meteo.mjs`, que já retorna `24.3 °C` e `25.1 °C`, e contará as requisições a `/weather?city=` pelo mesmo padrão de `E2E-02` e `E2E-03`. O caso `E2E-08`, que valida 360 px e 1280 px, será estendido para capturar a evidência com o alternador visível, cobrindo CA-13 sem criar um teste E2E adicional. Uma captura de tela do resultado em Fahrenheit será salva em `tasks/prd-troca-celsius-fahrenheit/evidences/`.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Criar `types/temperature-unit.ts` e `lib/temperature.ts` com seus testes unitários. A base pura fixa a fórmula, o arredondamento e o símbolo antes de qualquer interface depender deles.
2. Criar `TemperatureUnitToggle` com testes de estado acessível, acionamento e teclado. O componente é controlado e pode ser validado sem o resultado.
3. Alterar `WeatherResult` para receber `unit` e `onUnitChange`, formatar pelo módulo puro e renderizar o alternador; atualizar `WeatherResult.test.tsx`, que passa a refletir o arredondamento inteiro.
4. Elevar o estado na `WeatherView` e cobrir os quatro casos de integração, incluindo a ausência do alternador nos estados sem resultado.
5. Atualizar `E2E-01` para os valores arredondados, estender `E2E-08` e adicionar `E2E-10`.
6. Executar `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` em `frontend/`, e a suíte de `e2e/` com backend e mock ativos.

### Dependências técnicas

- Nenhuma dependência nova, nenhum lock file alterado e nenhuma variável de ambiente adicional.
- Nenhuma alteração em `backend/`; a suíte E2E continua exigindo backend e `mock-open-meteo.mjs` em execução, como já configurado em `e2e/playwright.config.ts`.
- Os limiares de cobertura de 80% já configurados em `frontend/vitest.config.ts` permanecem válidos e devem continuar sendo atendidos.
- A atualização de `WeatherResult.test.tsx` e de `E2E-01` é um bloqueador da etapa 3: enquanto não for feita, a suíte falhará por afirmar valores com casa decimal.

## Monitoramento e observabilidade

A funcionalidade não introduz evento de servidor, métrica ou health check. A troca é local ao navegador, não gera requisição e, portanto, não aparece nos logs do backend — o que é intencional e verificado por TI-02 e E2E-10. `GET /health` e os eventos `weather_query_completed`, `weather_provider_failed` e `unexpected_error` permanecem inalterados. A preferência de unidade não é registrada em log, por ser dado de interação sem valor operacional e por não haver coleta no cliente neste projeto.

## Considerações técnicas

### Principais decisões

- **Conversão na apresentação:** mantém o backend, o contrato e o cache do resultado intocados, atende ao pedido de solução simples e garante CA-05 por construção, já que não há parâmetro de unidade a enviar. A alternativa de enviar a unidade ao backend foi descartada por alterar o contrato sem benefício.
- **Módulo puro sem React:** conversão, arredondamento e símbolo ficam testáveis sem renderização, o que torna a maior parte da cobertura rápida e determinística.
- **Estado na view, por props:** `WeatherView` sobrevive entre buscas e é descartada no recarregamento, produzindo exatamente CA-07 e CA-08 sem persistência. Context foi descartado por ser excesso para um único bloco de resultado; um hook dedicado foi descartado por adicionar indireção a um único valor.
- **`aria-pressed` em dois botões:** expressa duas opções mutuamente exclusivas com markup mínimo, mantém as duas unidades legíveis o tempo todo e é consultável por `getByRole('button', { pressed: true })`. `radiogroup` foi descartado pelo markup e pela navegação por setas desnecessários; `<select>` foi descartado por exigir abrir uma lista para uma escolha binária.
- **Símbolo derivado da unidade selecionada:** `units.temperature` do payload descreve a origem do dado, não a preferência de exibição, e continua governando `%` e `km/h`. Usar o payload para o símbolo levaria a exibir `°C` ao lado de um valor convertido.
- **Arredondamento ao inteiro nas duas unidades:** decisão confirmada pelo usuário, aplicando RF6 e CA-03. Mantém a leitura consistente entre as escalas e evita precisão falsa em uma medida ambiental; o custo é alterar a exibição atual de Celsius e dois testes existentes.
- **Arredondar depois de converter:** arredondar antes introduziria erro de até meio grau Celsius, ampliado por 1,8 na conversão.
- **Sem memoização:** uma multiplicação e um arredondamento por render não justificam `useMemo`, conforme a skill `react`.

### Riscos conhecidos

- A mudança de arredondamento altera comportamento já entregue e quebra testes existentes se aplicada isoladamente. Mitigação: atualizar `WeatherResult.test.tsx` e `E2E-01` na mesma etapa da alteração do componente, conforme o sequenciamento.
- Valores entre `-0.5` e `0` produziriam `-0°C` sem tratamento explícito. Mitigação: normalização especificada e coberta por TU-03.
- O grupo adiciona dois pontos de parada na ordem de foco após o resultado. Mitigação: posicionar o grupo imediatamente após o valor em destaque e verificar a navegação em TU-07 e E2E-10.
- Um símbolo como único texto visível pode gerar nome acessível pobre ou violar WCAG 2.5.3 se o `aria-label` não contiver o texto visível. Mitigação: nomes `Celsius (°C)` e `Fahrenheit (°F)`, verificados em TU-05.
- Formatação de temperatura duplicada fora do módulo puro faria a exibição divergir da unidade ativa. Mitigação: `formatTemperature` como único produtor de texto de temperatura, verificado por TU-09 ao afirmar a ausência de valores em `°C` quando Fahrenheit está ativo.
- O alternador dentro de `WeatherResult` sempre desaparece com o resultado, inclusive após um erro subsequente. Isso é intencional por RF3, mas significa que a preferência continua ativa mesmo sem controle visível. Mitigação: TI-01 e TI-03 verificam ausência do controle e preservação da escolha como comportamentos separados.

### Conformidade com o AGENTS.md e as rules

Foram lidos integralmente `AGENTS.md` e todos os arquivos em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- A alteração é exclusiva de `frontend/` e de `e2e/`; a separação entre os aplicativos é preservada e nenhum comando é executado na raiz.
- O fluxo `view → components → services → backend` é respeitado. O módulo de conversão não é acesso ao backend e por isso não pertence a `services/`; ficará em `src/lib/`, pasta já existente no aplicativo.
- Cada tipo novo em arquivo próprio; arquivos abaixo de 100 linhas, funções abaixo de 30 linhas, no máximo três parâmetros e props declaradas explicitamente, sem spread.
- Tipagem explícita em parâmetros e retornos, `const` por padrão, comparações estritas, ausência de `any`, ternários simples e sem aninhamento, e nenhuma mutação de props ou payload — a conversão sempre produz novos valores.
- As constantes de conversão e os símbolos serão nomeados no módulo, sem números ou strings mágicos espalhados pelo JSX.
- Nenhum comentário será adicionado ao código; a intenção fica nos nomes `toFahrenheit`, `formatTemperature` e `TemperatureUnitToggle`.
- Sem linhas em branco dentro de funções e componentes, mantendo o estilo denso já praticado nos arquivos existentes.
- Todo código novo terá teste automatizado; a pirâmide é respeitada com base unitária ampla, quatro casos de integração e um único caso E2E, e a cobertura mínima de 80% permanece exigida.
- As regras de `node.md` não se aplicam: nenhum arquivo do backend é alterado e nenhuma operação assíncrona, variável de ambiente ou log é introduzida.
- Antes da conclusão, devem passar `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` em `frontend/`, além da suíte de `e2e/`.

### Conformidade com skills

- `react` — aplicável e aplicada. Componentes pequenos com responsabilidade única, props explícitas sem spread, componente controlado sem estado redundante, ausência de `useEffect` para valor derivado, sem memoização prematura, semântica de `button` com `aria-pressed` e nome acessível, foco visível e estilização por utilitários Tailwind. Nenhum desvio.
- `impeccable` — parcialmente aplicável. O alternador seguirá a direção registrada em `DESIGN.md`: âmbar como pista de estado ativo, tipografia e regras horizontais já existentes, contraste AA e legibilidade a partir de 360 px. Não será conduzida uma revisão visual completa do painel, por se tratar de um controle de duas opções acrescentado a uma tela já desenhada.
- `criar-techspec` — aplicada, com um desvio: a exploração do projeto foi feita por leitura direta do `AGENTS.md`, das cinco rules, dos componentes, hooks, tipos, testes de frontend e da suíte E2E, sem uso do agente Explore, porque a configuração desta sessão restringe o uso de subagentes e o escopo afetado era pequeno e integralmente identificado. As demais etapas da skill — análise do PRD, perguntas de esclarecimento, template preservado e especificação sem implementação — foram cumpridas.

### Arquivos relevantes e dependentes

Frontend a criar:

- `frontend/src/types/temperature-unit.ts`
- `frontend/src/lib/temperature.ts`
- `frontend/src/lib/temperature.test.ts`
- `frontend/src/components/TemperatureUnitToggle.tsx`
- `frontend/src/components/TemperatureUnitToggle.test.tsx`

Frontend a modificar:

- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/WeatherResult.test.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/views/WeatherView.test.tsx`

E2E a modificar:

- `e2e/weather-panel.spec.ts`

Dependentes verificados, sem alteração necessária:

- `frontend/src/hooks/useWeatherSearch.ts`, `frontend/src/services/weather-service.ts` e `frontend/src/types/weather-response.ts` — a unidade não participa da busca nem do contrato.
- `frontend/src/components/WeatherFeedback.tsx` e `frontend/src/components/SourceAttribution.tsx` — não exibem temperatura.
- `e2e/mock-open-meteo.mjs` — os valores atuais já cobrem os casos de conversão do E2E.
- Todo o diretório `backend/`.
