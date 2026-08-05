# Tarefa 2.0: Troca de idioma no frontend e validação E2E

## Visão geral

Entregar a troca de idioma vista pelo usuário: um botão alternador no cabeçalho que muda toda a experiência entre pt-BR e inglês em um acionamento, sem recarregar a página, sem requisição e sem perder o texto digitado nem o resultado exibido. A tarefa cria a camada de i18n própria do frontend — tipos, dicionários, contexto, hook e formatadores baseados em `Intl` —, migra os componentes existentes para textos traduzidos, substitui a mensagem de erro guardada no estado pelo código do erro e passa a enviar `lang` na consulta ao backend.

Depende da tarefa 1.0, que expõe `weatherCode` e `countryCode`. Encerra com o mock da Open-Meteo atualizado e a suíte E2E cobrindo os fluxos críticos da funcionalidade nos dois idiomas.

<skills>
### Conformidade com skills

- `react` — obrigatória antes de qualquer alteração no frontend. Componentes pequenos com responsabilidade única e props explícitas sem spread; hooks com prefixo `use`; `useEffect` apenas para sincronizar o documento, que é sistema externo; sem `useMemo` desnecessário; sem estado derivado redundante; atualização funcional em `toggleLanguage`; semântica de `button`, nome acessível, foco visível e estilização por Tailwind.
- `executar-task` — conduz a implementação desta tarefa.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada de `AGENTS.md` e de todas as rules em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- Manter o fluxo `view → components/hooks → services → backend`. Módulos de i18n não fazem acesso HTTP e o serviço HTTP não conhece dicionários; nenhuma importação nova pode criar ciclo.
- `useWeatherSearch` recebe o idioma por parâmetro e não importa o contexto de i18n, permanecendo testável sem provider.
- Arquivos até 100 linhas, funções até 30 linhas, componentes React até 30 linhas, no máximo três parâmetros. Dicionários, rótulos WMO e formatadores ficam em arquivos separados por idioma e por responsabilidade.
- Cada tipo compartilhado em arquivo próprio dentro de `frontend/src/types/`.
- Tipagem explícita, sem `any`, `unknown` refinado na validação da resposta HTTP, `const` por padrão, comparações estritas, arrow functions apenas em callbacks e nenhum ternário aninhado.
- Sem comentários no código; nomes e extração de funções expressam a intenção.
- Sem dependência nova e sem alteração de lock file em nenhum dos três projetos.
- Desvio registrado e justificado na TechSpec: criação da pasta `frontend/src/i18n/`, não prevista em `folder-structure.md`, por representar responsabilidade clara e recorrente que não cabe em `services/`, `components/`, `hooks/` ou `types/`.
- Testes E2E permanecem em `e2e/`, fora de `frontend/` e `backend/`. Todo código novo tem teste; cobertura mínima de 80% mantida pelos limiares já configurados em `frontend/vitest.config.ts`.
</rules>

<requirements>
- RF1 a RF4: controle de idioma no cabeçalho, visível sem rolagem a partir de 360 px, alternando em um acionamento, comunicando idioma ativo e destino por texto, disponível nos quatro estados.
- RF5 a RF8: todo texto de produto no idioma ativo, incluindo rótulos acessíveis não visíveis, sem sobra do idioma anterior.
- RF9 e RF10: condição meteorológica traduzida a partir de `weatherCode` e país traduzido a partir de `countryCode`, com degradação para o valor recebido quando não houver correspondência.
- RF11 e RF12: unidades métricas preservadas nos dois idiomas e valores numéricos formatados pela convenção do idioma ativo.
- RF13 a RF17: troca preserva texto digitado, resultado, consulta em andamento e mensagens visíveis, sem recarregar a página nem mudar de endereço.
- RF18 e RF19: idioma padrão pt-BR em todo carregamento, sem persistência da escolha.
- RF20 e RF21: idioma declarado do documento e título da página coerentes com o idioma ativo.
</requirements>

## Subtarefas

- [x] 2.1 Criar os tipos `language.ts`, `translation-key.ts`, `translations.ts` e `language-context-value.ts` e os dicionários `i18n/pt-br.ts` e `i18n/en.ts` tipados como `Record<TranslationKey, string>`, com a tabela de chaves da TechSpec.
- [x] 2.2 Criar `i18n/language-context.ts`, `components/LanguageProvider.tsx`, `hooks/useTranslation.ts` e `hooks/useDocumentLanguage.ts`, mantendo o idioma em estado, sem persistência e com padrão pt-BR a cada carregamento.
- [x] 2.3 Criar `i18n/weather-conditions-pt-br.ts`, `i18n/weather-conditions-en.ts`, `i18n/weather-condition-label.ts`, `i18n/format-measurement.ts` e `i18n/country-name.ts`, com as degradações previstas.
- [x] 2.4 Criar `components/LanguageToggle.tsx` e compor `App.tsx` e `WeatherView.tsx`, posicionando o alternador no cabeçalho e garantindo que ele não seja remontado na troca, para preservar o foco.
- [x] 2.5 Migrar `WeatherView`, `WeatherSearchForm`, `WeatherFeedback`, `WeatherResult` e `SourceAttribution` para textos traduzidos, incluindo o `aria-label` da seção de consulta.
- [x] 2.6 Substituir a mensagem pelo código do erro em `types/api-error.ts`, `types/weather-search-state.ts`, `services/weather-service.ts`, `hooks/useWeatherSearch.ts` e `WeatherFeedback`, eliminando as mensagens fixas do frontend.
- [x] 2.7 Enviar `lang` em `GET /weather` a partir do idioma ativo e atualizar a validação da resposta para exigir `weatherCode` e aceitar `countryCode` nulo.
- [x] 2.8 Atualizar `e2e/mock-open-meteo.mjs` para devolver `country_code` e refletir o `language` recebido, e ajustar os testes existentes de frontend e E2E afetados pelo contrato e pelo cabeçalho.
- [x] 2.9 Escrever os testes de unidade, de integração e E2E desta tarefa.
- [x] 2.10 Executar `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` em `frontend/`, e a suíte de `e2e/`, corrigindo o que falhar.

## Detalhes de implementação

Seguir `techspec.md`:

- “Arquitetura do sistema → Visão dos componentes” para o fluxo de tradução e a lista de componentes novos e modificados no frontend.
- “Design de implementação → Principais interfaces” para `useTranslation`, `weatherConditionLabel`, `formatMeasurement`, `countryName` e `WeatherService`, incluindo a decisão de não memoizar o valor do contexto.
- “Modelos de dados” para `Language`, `TranslationKey`, `Translations`, `LanguageContextValue` e `ApiError`, para a tabela completa de chaves de tradução e para a nota sobre composição de frase com links em `SourceAttribution`.
- “Modelos de dados → Mapeamento código WMO → rótulo por idioma” e “Formatação de número e de país no cliente”, respeitando a nota de espaçamento preservado entre valor e unidade.
- “Endpoints da API → `GET /weather`” para o envio de `lang` e para os campos novos da resposta.
- “Considerações técnicas → Principais decisões” para erro guardado por código, idioma por parâmetro em `search` e ausência de região viva adicional para a troca.
- “Considerações técnicas → Riscos conhecidos” para comprimento dos textos em 360 px, degradação de `Intl.DisplayNames` e divergência entre dicionários.

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
- CA-14
- CA-15
- CA-16
- CA-17

## Testes da tarefa

### Testes de unidade

- [x] TU-FE-10 — Garante paridade entre os dicionários
- [x] TU-FE-11 — Traduz todos os códigos WMO nos dois idiomas
- [x] TU-FE-12 — Degrada rótulo de código desconhecido
- [x] TU-FE-13 — Formata número conforme o idioma
- [x] TU-FE-14 — Traduz o país a partir do `countryCode`
- [x] TU-FE-15 — Degrada país sem código ou sem tradução
- [x] TU-FE-16 — Alterna o idioma em uma chamada
- [x] TU-FE-17 — Falha ao usar a tradução fora do provider
- [x] TU-FE-18 — Sincroniza `lang` e `title` do documento
- [x] TU-FE-19 — Expõe nome acessível e texto do alternador
- [x] TU-FE-20 — Traduz o erro a partir do código
- [x] TU-FE-21 — Envia `lang` na consulta ao backend

### Testes de integração

- [x] TI-FE-10 — Traduz a tela inteira no estado inicial
- [x] TI-FE-11 — Traduz o resultado sem nova requisição
- [x] TI-FE-12 — Preserva o texto digitado ao trocar
- [x] TI-FE-13 — Traduz validação e erro sem perder o estado
- [x] TI-FE-14 — Não cancela consulta em andamento

### Testes E2E

- [x] E2E-10 — Encontra o alternador sem rolagem em 360 px
- [x] E2E-11 — Traduz a tela inicial completa
- [x] E2E-12 — Mantém e traduz o resultado exibido
- [x] E2E-13 — Não faz requisição ao trocar e responde em até 300 ms
- [x] E2E-14 — Preserva o texto digitado
- [x] E2E-15 — Traduz mensagens de validação e de erro
- [x] E2E-16 — Traduz durante consulta em andamento
- [x] E2E-17 — Ajusta `lang` e título do documento
- [x] E2E-18 — Opera o alternador por teclado
- [x] E2E-19 — Volta ao padrão após recarregar
- [x] E2E-20 — Mantém layout em 360 px e 1280 px em inglês
- [x] E2E-21 — Consulta em inglês envia `lang` e não regride

## Arquivos relevantes

A criar:

- `frontend/src/i18n/language-context.ts`
- `frontend/src/i18n/translations.ts`
- `frontend/src/i18n/pt-br.ts`
- `frontend/src/i18n/en.ts`
- `frontend/src/i18n/weather-conditions-pt-br.ts`
- `frontend/src/i18n/weather-conditions-en.ts`
- `frontend/src/i18n/weather-condition-label.ts`
- `frontend/src/i18n/format-measurement.ts`
- `frontend/src/i18n/country-name.ts`
- `frontend/src/components/LanguageProvider.tsx`
- `frontend/src/components/LanguageToggle.tsx`
- `frontend/src/hooks/useTranslation.ts`
- `frontend/src/hooks/useDocumentLanguage.ts`
- `frontend/src/types/language.ts`
- `frontend/src/types/translation-key.ts`
- `frontend/src/types/translations.ts`
- `frontend/src/types/language-context-value.ts`
- `e2e/language-switch.spec.ts`
- testes `*.test.ts` e `*.test.tsx` próximos aos módulos correspondentes

A modificar:

- `frontend/src/App.tsx`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/views/WeatherView.test.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/components/WeatherFeedback.tsx`
- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/WeatherResult.test.tsx`
- `frontend/src/components/SourceAttribution.tsx`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/hooks/useWeatherSearch.test.ts`
- `frontend/src/services/weather-service.ts`
- `frontend/src/services/weather-service.test.ts`
- `frontend/src/types/weather-response.ts`
- `frontend/src/types/api-error.ts`
- `frontend/src/types/weather-search-state.ts`
- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
