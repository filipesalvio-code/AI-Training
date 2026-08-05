# Tarefa 1.0: Contrato bilíngue no backend

## Visão geral

Preparar o backend para que o frontend possa traduzir o resultado sem nova requisição. A rota `GET /weather` passa a aceitar `lang` opcional, repassado como idioma da Geocoding API, e o contrato de sucesso ganha `current.weatherCode` e `location.countryCode`. O campo `current.condition` permanece em pt-BR como legado, preservando a compatibilidade exigida pelo PRD. Nenhuma tradução para inglês é escrita no backend: a tarefa entrega apenas os dados que tornam a tradução possível no cliente.

A entrega é validável isoladamente por Supertest, antes de qualquer alteração no frontend.

<skills>
### Conformidade com skills

- `executar-task` — conduz a implementação desta tarefa.
- `react` — não se aplica: esta tarefa não altera código do frontend.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Leitura confirmada de `AGENTS.md` e de todas as rules em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- Manter o fluxo `routes → services → data`: a rota lê `lang`, o serviço normaliza e orquestra, e a camada `data` monta a URL externa. Nenhuma importação nova pode apontar para trás nem criar ciclo.
- Cada tipo compartilhado continua em arquivo próprio dentro de `backend/src/types/`.
- Arquivos até 100 linhas, funções até 30 linhas, no máximo três parâmetros, tipagem explícita, sem `any`, `const` por padrão, comparações estritas e cláusulas de guarda.
- Validar o valor bruto de `lang` como `unknown` antes de usá-lo; a normalização não pode lançar erro nem produzir `400`.
- Sem comentários no código; nomes e extração de funções expressam a intenção.
- Sem variável de ambiente nova, sem dependência nova, sem alteração de lock file e sem operação bloqueante; logging centralizado e graceful shutdown permanecem inalterados.
- Todo código novo tem teste; cobertura mínima de 80% mantida pelos limiares já configurados em `backend/vitest.config.ts`. Nenhum teste determinístico acessa a Open-Meteo real.
</rules>

<requirements>
- RF9: expor `current.weatherCode` para que a descrição da condição possa ser apresentada no idioma ativo, cobrindo todas as condições já suportadas.
- RF10: expor `location.countryCode` e localizar cidade, região e país na consulta conforme `lang`; ausência de código ou de denominação degrada para o valor recebido, sem erro.
- RF11: manter as unidades métricas inalteradas no contrato.
- Restrição do PRD: o contrato HTTP existente permanece compatível — `current.condition` continua presente e em pt-BR, e os códigos de erro seguem estáveis e independentes de idioma.
- Restrição do PRD: `lang` inválido, repetido ou ausente degrada para o padrão e nunca produz erro de validação.
</requirements>

## Subtarefas

- [x] 1.1 Criar `backend/src/services/normalize-language.ts` convertendo o valor bruto de `lang` em `'pt' | 'en'`, conforme a tabela de mapeamento da TechSpec, sem lançar erro para valor desconhecido, array ou tipo inesperado.
- [x] 1.2 Estender `parse-geocoding-response.ts` para extrair `country_code`, normalizando para maiúsculas quando corresponder a duas letras e para `null` nos demais casos, sem invalidar a consulta.
- [x] 1.3 Ajustar `WeatherProvider` e `OpenMeteoClient` para receber o idioma em `searchFirstLocation` e enviá-lo em `language`, removendo o valor fixo `pt`.
- [x] 1.4 Atualizar os tipos `resolved-location.ts`, `weather-location.ts` e a montagem em `get-current-weather.ts` para incluir `countryCode` e `weatherCode`, preservando `condition` em pt-BR.
- [x] 1.5 Ajustar `weather-route.ts` para ler `lang`, normalizá-lo e repassá-lo ao caso de uso, mantendo a validação atual de `city` como única origem de `400`.
- [x] 1.6 Escrever os testes de unidade e de integração desta tarefa e atualizar os testes existentes do backend afetados pelos campos novos.
- [x] 1.7 Executar `npm run build`, `npm test` e `npm run test:coverage` em `backend/` e corrigir o que falhar.

## Detalhes de implementação

Seguir `techspec.md`:

- “Arquitetura do sistema → Visão dos componentes”, lista de componentes modificados no backend.
- “Design de implementação → Principais interfaces” para as assinaturas de `WeatherProvider`, `GetCurrentWeather` e `normalizeLanguage`.
- “Modelos de dados” para `ResolvedLocation`, `WeatherLocation`, `CurrentConditions` e `WeatherResponse`, incluindo a nota sobre o campo legado `condition`.
- “Modelos de dados → Mapeamento `lang` → idioma da geocodificação” e “Mapeamento Geocoding API → contrato (complemento)”.
- “Endpoints da API → `GET /weather`” para parâmetros, respostas e exemplos, inclusive `lang` desconhecido e país sem código.
- “Pontos de integração” para o comportamento do parâmetro `language` na Geocoding API.

## Critérios de aceitação relacionados

- CA-04
- CA-06
- CA-10
- CA-17

## Testes da tarefa

### Testes de unidade

- [x] TU-BE-10 — Normaliza `lang` conhecido, ausente e inválido
- [x] TU-BE-11 — Repassa o idioma normalizado à geocodificação
- [x] TU-BE-12 — Extrai e normaliza `country_code`
- [x] TU-BE-13 — Inclui `weatherCode` junto de `condition` no contrato

### Testes de integração

- [x] TI-BE-10 — Responde 200 com `lang=en` e observa o provedor
- [x] TI-BE-11 — Ignora `lang` inválido sem quebrar o contrato
- [x] TI-BE-12 — Preserva os erros existentes com `lang` presente

### Testes E2E

Não se aplica a esta tarefa; a verificação de ponta a ponta ocorre na tarefa 2.0.

## Arquivos relevantes

A criar:

- `backend/src/services/normalize-language.ts`
- testes `*.test.ts` correspondentes aos módulos novos

A modificar:

- `backend/src/routes/weather-route.ts`
- `backend/src/services/get-current-weather.ts`
- `backend/src/data/open-meteo-client.ts`
- `backend/src/data/parse-geocoding-response.ts`
- `backend/src/types/weather-provider.ts`
- `backend/src/types/resolved-location.ts`
- `backend/src/types/weather-location.ts`
- `backend/src/types/current-conditions.ts`
- `backend/src/weather-route.test.ts`
- `backend/src/services/weather-services.test.ts`
- `backend/src/data/parsers.test.ts`
- `backend/src/data/open-meteo-client.test.ts`
