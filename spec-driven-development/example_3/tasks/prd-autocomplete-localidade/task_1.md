# Tarefa 1.0: Implementar o backend de localidades e clima por seleção estruturada

## Visão geral

Implementar os contratos, validações, integração com a Open-Meteo e endpoints necessários para buscar sugestões de localidades e consultar o clima usando exatamente a localidade escolhida pelo usuário.

<skills>
### Conformidade com skills

Nenhuma skill específica adicional em `.agents/skills/` é necessária para o backend. A implementação deve respeitar o `AGENTS.md` e todas as rules em `.agents/rules/`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

`AGENTS.md` e todas as rules em `.agents/rules/` foram lidos. Aplicam-se especialmente:

- manter a separação `routes → services → data → types`;
- manter arquivos TypeScript com até 100 linhas, funções com até 30 linhas e no máximo três parâmetros;
- usar TypeScript estrito, `unknown` nas fronteiras externas, sem `any`, sem mutação e com comparações estritas;
- usar operações assíncronas sem bloquear o event loop, timeout configurável, logging centralizado e sem dados sensíveis nos logs;
- não adicionar retry, cache ou persistência;
- criar testes automatizados para todo código novo, seguindo FIRST, AAA ou Given/When/Then, com cobertura mínima de 80%.

Não há desvios planejados.
</rules>

<requirements>
- RF1 e RF2: normalizar a query e exigir ao menos dois caracteres Unicode alfanuméricos úteis.
- RF4: limitar a resposta a cinco localidades.
- RF5: retornar cidade, divisão administrativa quando disponível, país e coordenadas.
- RF8 e RF9: aceitar a seleção estruturada e consultar o clima pelas coordenadas exatas, preservando a identidade da localidade homônima escolhida.
- RF11: representar ausência de correspondências como sucesso com lista vazia.
- RF12: normalizar falhas, timeout, respostas não exitosas e payloads inválidos como indisponibilidade do serviço de localidades.
- Preservar `GET /health` e o contrato existente de resposta meteorológica.
- Expor `GET /locations` e substituir `GET /weather?city` por `POST /weather`, conforme o contrato da TechSpec.
- Enviar `Cache-Control: no-store`, não persistir dados e não expor query, URLs ou causas internas nos erros e logs públicos.
</requirements>

## Subtarefas

- [x] 1.1 Definir os tipos de domínio, contratos HTTP, códigos de erro e interface do provedor descritos na TechSpec.
- [x] 1.2 Implementar normalização de query, validação da localidade selecionada, parsing seguro de payloads `unknown` e mapeamento dos resultados da geocodificação.
- [x] 1.3 Implementar `searchLocations`, `SearchLocations` e `GET /locations`, incluindo parâmetros fixos, limite de cinco itens, timeout, tratamento de falhas, observabilidade e `no-store`.
- [x] 1.4 Alterar `GetCurrentWeather` e `POST /weather` para validar a seleção e usar somente suas coordenadas, removendo o fluxo de geocodificação por texto.
- [x] 1.5 Criar testes unitários e de integração com `WeatherProvider` stubado, sem `listen` e sem rede externa.
- [x] 1.6 Executar os testes e a cobertura do backend, corrigindo falhas sem reduzir os critérios de validação.

## Detalhes de implementação

Consultar `techspec.md`, especialmente as seções “Arquitetura do sistema”, “Modelos de dados”, “Endpoints da API”, “Pontos de integração”, “Abordagem de testes” e “Sequenciamento do desenvolvimento”. Os detalhes de tipos, envelopes, mensagens, parâmetros da Open-Meteo, timeout, logging e mapeamentos devem ser tratados como fonte de verdade na TechSpec, sem duplicar contratos fora dos módulos apropriados.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-08
- CA-09
- CA-11

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-BE-01 — Normaliza query e aplica o limite mínimo
- [x] TU-BE-02 — Mapeia até cinco sugestões e região anulável
- [x] TU-BE-03 — Diferencia lista vazia de payload inválido
- [x] TU-BE-04 — Pesquisa localidades com parâmetros fixos e timeout
- [x] TU-BE-05 — Valida a localidade selecionada
- [x] TU-BE-06 — Consulta a previsão com as coordenadas exatas

### Testes de integração (se aplicável)

- [x] TI-BE-01 — Retorna até cinco localidades com `no-store`
- [x] TI-BE-02 — Rejeita query insuficiente sem chamar o provedor
- [x] TI-BE-03 — Retorna sucesso vazio
- [x] TI-BE-04 — Normaliza falha da origem de localidades
- [x] TI-BE-05 — Consulta clima para a homônima escolhida
- [x] TI-BE-06 — Rejeita seleção inválida antes da previsão

### Testes E2E (se aplicável)

Não há testes E2E nesta tarefa. Eles serão executados na tarefa 2 após a integração do frontend.

## Arquivos relevantes

- `tasks/prd-autocomplete-localidade/prd.md`
- `tasks/prd-autocomplete-localidade/techspec.md`
- `backend/src/app.ts`
- `backend/src/routes/locations-route.ts`
- `backend/src/routes/weather-route.ts`
- `backend/src/services/normalize-location-query.ts`
- `backend/src/services/validate-selected-location.ts`
- `backend/src/services/search-locations.ts`
- `backend/src/services/get-current-weather.ts`
- `backend/src/data/open-meteo-client.ts`
- `backend/src/data/parse-geocoding-response.ts`
- `backend/src/data/parse-forecast-response.ts`
- `backend/src/errors/app-error.ts`
- `backend/src/middleware/error-handler.ts`
- `backend/src/observability/logger.ts`
- `backend/src/types/weather-provider.ts`
- `backend/src/types/coordinates.ts`
- `backend/src/types/resolved-location.ts`
- `backend/src/types/location-suggestion.ts`
- `backend/src/types/location-suggestions-response.ts`
- Testes `*.test.ts` próximos aos módulos backend
- `backend/vitest.config.ts`
