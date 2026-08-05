# Tarefa 2.0: Implementar a consulta meteorológica completa no backend

## Visão geral

Entregar `GET /weather?city=...` de ponta a ponta no backend: validação da cidade, resolução da primeira localidade, consulta das condições atuais, tradução WMO, contrato público, resiliência da integração e respostas HTTP testadas.

<skills>
### Conformidade com skills

- `executar-task`: usar para implementar esta tarefa depois da conclusão da tarefa 1 e atualizar seu estado somente após todas as validações passarem.
- Não há skill técnica específica de backend em `.agents/skills/`; aplicar integralmente as rules de Node.js, JavaScript/TypeScript, estrutura e testes.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`.

- Manter a direção `routes → services → data`, deixando validação HTTP e serialização na rota e regras de negócio nos serviços.
- Usar `fetch` nativo e `async/await`, sem I/O síncrono, retry, cache ou bloqueio do event loop.
- Validar respostas externas recebidas como `unknown`; não usar `any` nem confiar em payloads externos.
- Manter cada tipo compartilhado em arquivo próprio e respeitar os limites de arquivos, funções e parâmetros.
- Usar constantes para códigos, unidades, timeout e demais valores de domínio; preferir guard clauses e estruturas imutáveis.
- Não registrar a cidade, corpos externos, IP, stack trace público ou detalhes sensíveis.
- Testar regras unitariamente e contratos HTTP por integração com stubs determinísticos, sem rede real.
- Atualizar dependências somente com npm e preservar o lockfile do backend.
- Não há desvio planejado das regras.
</rules>

<requirements>
- RF2: validar a cidade normalizada, exigindo ao menos dois caracteres Unicode alfanuméricos úteis.
- RF3 e RF4: selecionar somente o primeiro resultado e retornar cidade, primeira divisão administrativa disponível ou `null`, e país.
- RF5 e RF6: integrar geocodificação e previsão atuais da Open-Meteo por HTTPS.
- RF7 e RF8: expor ao frontend somente o contrato reduzido do backend, incluindo localização, condições, unidades e fonte.
- RF9 a RF12: entregar temperatura, sensação térmica, condição em pt-BR, umidade e vento nas unidades métricas definidas.
- RF14: diferenciar `INVALID_CITY`, `CITY_NOT_FOUND`, `WEATHER_SERVICE_UNAVAILABLE` e `INTERNAL_ERROR` por status e envelope estáveis.
- RF17: incluir os metadados de atribuição à Open-Meteo e à licença no contrato de sucesso.
- Compartilhar um único orçamento de 2.500 ms entre geocodificação e previsão, abortar a cadeia ao esgotá-lo e não executar retry.
- Rejeitar como indisponibilidade qualquer status externo não exitoso, timeout, falha de rede, JSON inválido, unidade inesperada, campo obrigatório ausente, limite numérico inválido ou código WMO desconhecido.
- Retornar `Cache-Control: no-store`, não persistir buscas e preservar `/health` isolado.
- Emitir os eventos de observabilidade e durações especificados sem registrar o texto da cidade.
</requirements>

## Subtarefas

- [x] 2.1 Definir os tipos públicos e internos, a interface `WeatherProvider` e os erros esperados da consulta.
- [x] 2.2 Implementar normalização da cidade, resolução administrativa, tradução WMO e o caso de uso `GetCurrentWeather`.
- [x] 2.3 Implementar e testar os parsers de geocodificação e previsão para entradas `unknown`.
- [x] 2.4 Implementar o cliente Open-Meteo com parâmetros mínimos, URLs configuráveis, sinal compartilhado, timeout total e nenhuma repetição automática.
- [x] 2.5 Implementar e registrar a rota `/weather`, os headers e a normalização dos erros HTTP.
- [x] 2.6 Implementar os oito casos unitários do backend com stubs e relógio controlado.
- [x] 2.7 Implementar os quatro casos de integração de `/weather` com Supertest e dependências controladas.
- [x] 2.8 Executar build, testes e cobertura do backend, confirmando o limiar mínimo de 80%.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “Principais interfaces”, “Modelos de dados”, os mapeamentos de Geocoding, Forecast e WMO, “Parâmetros fixos na origem”, “GET /weather”, “Pontos de integração”, “Monitoramento e observabilidade” e “Principais decisões”. Não repetir tipos ou regras fora das camadas indicadas na especificação.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-05
- CA-06
- CA-07
- CA-09
- CA-13

## Testes da tarefa

### Testes de unidade

- [ ] TU-BE-01 — Normaliza espaços e aceita nomes internacionais válidos
- [ ] TU-BE-02 — Rejeita cidade ausente ou com menos de dois caracteres úteis
- [ ] TU-BE-03 — Seleciona somente o primeiro resultado da geocodificação
- [ ] TU-BE-04 — Normaliza a divisão administrativa ausente
- [ ] TU-BE-05 — Mapeia campos e unidades da previsão
- [ ] TU-BE-06 — Traduz todos os códigos WMO conhecidos
- [ ] TU-BE-07 — Rejeita payload externo inválido ou código desconhecido
- [ ] TU-BE-08 — Encerra as duas chamadas no orçamento total sem retry

### Testes de integração

- [ ] TI-BE-01 — Retorna o contrato 200 e envia parâmetros mínimos à Open-Meteo
- [ ] TI-BE-02 — Rejeita query inválida sem acesso externo
- [ ] TI-BE-03 — Converte geocodificação vazia em 404
- [ ] TI-BE-04 — Normaliza falhas das duas APIs em 503

## Arquivos relevantes

- `backend/src/app.ts`
- `backend/src/config/environment.ts`
- `backend/src/routes/weather-route.ts`
- `backend/src/services/normalize-city.ts`
- `backend/src/services/get-current-weather.ts`
- `backend/src/services/weather-condition.ts`
- `backend/src/data/open-meteo-client.ts`
- `backend/src/data/parse-geocoding-response.ts`
- `backend/src/data/parse-forecast-response.ts`
- `backend/src/errors/app-error.ts`
- `backend/src/middleware/error-handler.ts`
- `backend/src/observability/logger.ts`
- `backend/src/types/coordinates.ts`
- `backend/src/types/resolved-location.ts`
- `backend/src/types/provider-conditions.ts`
- `backend/src/types/weather-location.ts`
- `backend/src/types/current-conditions.ts`
- `backend/src/types/weather-units.ts`
- `backend/src/types/source-attribution.ts`
- `backend/src/types/weather-response.ts`
- `backend/src/types/api-error.ts`
- `backend/src/types/weather-provider.ts`
- Testes `*.test.ts` próximos aos módulos correspondentes
