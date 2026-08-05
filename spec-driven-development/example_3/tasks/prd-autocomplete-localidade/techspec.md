# Especificação técnica

## Resumo

A solução adicionará `GET /locations?query=...` ao backend para retornar até cinco localidades da Geocoding API da Open-Meteo. O frontend consultará esse endpoint após 200 ms sem novas edições, cancelará requisições obsoletas e apresentará os resultados em um combobox acessível. Não haverá novas bibliotecas, cache, retry, persistência ou chamada direta do navegador à Open-Meteo.

Ao selecionar uma sugestão, o frontend enviará a localidade estruturada para `POST /weather`. O backend validará cidade, região, país e coordenadas e consultará diretamente a previsão para as coordenadas escolhidas. Esse contrato substituirá `GET /weather?city=...`, eliminando a nova geocodificação que poderia escolher outra cidade homônima. O contrato de resposta meteorológica permanecerá inalterado.

## Arquitetura do sistema

### Visão dos componentes

Fluxo de sugestões:

```text
LocationAutocomplete
  → useLocationSuggestions (debounce de 200 ms)
    → locationService
      → GET /locations?query=...
        → locationsRoute
          → SearchLocations
            → OpenMeteoClient.searchLocations
          → LocationSuggestionsResponse
```

Fluxo de seleção e clima:

```text
LocationAutocomplete
  → WeatherView.onLocationSelect
    → useWeatherSearch
      → weatherService
        → POST /weather { location }
          → weatherRoute
            → GetCurrentWeather
              → OpenMeteoClient.getCurrentConditions
            → WeatherResponse
```

Componentes novos ou modificados no backend:

- `src/app.ts` — registrará `GET /locations` e substituirá o registro da consulta meteorológica antiga por `POST /weather`, mantendo injeção do provedor para testes.
- `src/routes/locations-route.ts` — novo handler que fará validação HTTP básica de `query`, aplicará `Cache-Control: no-store` e delegará ao caso de uso.
- `src/routes/weather-route.ts` — passará a receber o corpo estruturado da localidade selecionada e delegará sua validação ao serviço.
- `src/services/normalize-location-query.ts` — substituirá o conceito específico de cidade, normalizando espaços e exigindo dois caracteres Unicode alfanuméricos úteis.
- `src/services/validate-selected-location.ts` — validará textos obrigatórios, divisão administrativa anulável e limites WGS84 das coordenadas recebidas, retornando uma `LocationSuggestion` confiável.
- `src/services/search-locations.ts` — novo caso de uso que controlará timeout, chamará o provedor, limitará a cinco resultados e montará o contrato público.
- `src/services/get-current-weather.ts` — deixará de geocodificar texto e consultará as condições pelas coordenadas validadas da seleção.
- `src/data/open-meteo-client.ts` — substituirá `searchFirstLocation` por `searchLocations`, usando `count=5`; a consulta de previsão existente será preservada.
- `src/data/parse-geocoding-response.ts` — validará e mapeará uma lista de até cinco localidades, em vez de somente o primeiro item.
- `src/types/weather-provider.ts` — refletirá as operações `searchLocations` e `getCurrentConditions`.
- `src/types/location-suggestion.ts` — novo contrato público de uma sugestão.
- `src/types/location-suggestions-response.ts` — novo envelope público da lista.
- `src/errors/app-error.ts` — adicionará códigos e mensagens específicos para query, seleção e indisponibilidade de localidades.
- `src/observability/logger.ts` — aceitará eventos e contexto da busca de sugestões sem registrar o texto pesquisado.

Componentes novos ou modificados no frontend:

- `src/views/WeatherView.tsx` — coordenará a query controlada, a sugestão selecionada e o início imediato da consulta meteorológica. Selecionar preencherá o campo e suspenderá novas sugestões até a próxima edição do usuário.
- `src/components/LocationAutocomplete.tsx` — novo combobox que comporá input, feedback e lista, mantendo o foco DOM no campo.
- `src/components/LocationSuggestionsList.tsx` — nova lista semântica com as opções e o destaque ativo.
- `src/components/LocationSuggestionFeedback.tsx` — novo feedback para carregamento, lista vazia e indisponibilidade.
- `src/hooks/useLocationSuggestions.ts` — novo hook responsável pelo debounce, estados assíncronos, cancelamento e proteção contra respostas fora de ordem.
- `src/hooks/useComboboxNavigation.ts` — novo hook de interação local para abrir, fechar, percorrer e selecionar opções sem misturar acesso HTTP ao componente.
- `src/services/location-service.ts` — novo cliente e parser de `GET /locations`.
- `src/hooks/useWeatherSearch.ts` — receberá uma `LocationSuggestion` em vez de texto livre.
- `src/services/weather-service.ts` — passará a chamar `POST /weather` com corpo JSON e manterá a validação do `WeatherResponse` existente.
- `src/types/location-suggestion.ts` — novo contrato compartilhado com a interface.
- `src/types/location-search-state.ts` — nova união discriminada dos estados das sugestões.
- `src/types/api-error.ts` — incluirá os novos códigos públicos.
- `src/components/WeatherSearchForm.tsx` — será removido; a seleção no combobox substituirá campo e botão de envio.

Relações e limites:

- O frontend conhecerá apenas os contratos HTTP do backend.
- Views e componentes não usarão `fetch`; o acesso ficará em `services` e os estados assíncronos em hooks.
- Rotas dependerão de serviços, serviços dependerão da interface do provedor e `data` implementará essa interface.
- O backend não armazenará sugestões ou localidades selecionadas.
- O foco permanecerá no input durante a navegação; o item ativo será comunicado por `aria-activedescendant`.
- `GET /health` e o contrato meteorológico de resposta não serão alterados.

## Design de implementação

### Principais interfaces

```text
WeatherProvider
  searchLocations(query, signal) -> Promise<ResolvedLocation[]>
  getCurrentConditions(coordinates, signal) -> Promise<ProviderConditions>
```

```text
SearchLocations
  execute(query) -> Promise<LocationSuggestionsResponse>

GetCurrentWeather
  execute(location) -> Promise<WeatherResponse>
```

```text
LocationService (frontend)
  searchLocations(query, signal) -> Promise<LocationSuggestion[]>

WeatherService (frontend)
  searchWeather(location, signal) -> Promise<WeatherResponse>
```

```text
useLocationSuggestions(query, enabled)
  -> { state, dismiss }

useWeatherSearch()
  -> { state, search(location) }
```

### Modelos de dados

#### `Coordinates` — coordenadas WGS84 da localidade

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `latitude` | `number` | sim | Número finito entre `-90` e `90`. |
| `longitude` | `number` | sim | Número finito entre `-180` e `180`. |

```text
{
  "latitude": -23.5475,
  "longitude": -46.6361
}
```

#### `ResolvedLocation` — localidade interna validada a partir da Open-Meteo

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `city` | `string` | sim | Nome localizado e não vazio. |
| `administrativeArea` | `string \| null` | sim | Primeiro valor disponível entre `admin1`, `admin2`, `admin3` e `admin4`. |
| `country` | `string` | sim | País localizado e não vazio. |
| `coordinates` | `Coordinates` | sim | Coordenadas validadas. |

```text
{
  "city": "São Paulo",
  "administrativeArea": "São Paulo",
  "country": "Brasil",
  "coordinates": {
    "latitude": -23.5475,
    "longitude": -46.6361
  }
}
```

> **Degradação de divisão administrativa:** se todos os níveis administrativos estiverem ausentes, `administrativeArea` será `null`; os demais campos continuam obrigatórios.

```text
{
  "administrativeArea": null
}
```

#### `LocationSuggestion` — sugestão pronta para exibição e seleção

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `city` | `string` | sim | Cidade exibida como texto principal. |
| `administrativeArea` | `string \| null` | sim | Estado ou região, quando disponível. |
| `country` | `string` | sim | País exibido para desambiguação. |
| `coordinates` | `Coordinates` | sim | Coordenadas usadas após a seleção. |

```text
{
  "city": "Springfield",
  "administrativeArea": "Illinois",
  "country": "Estados Unidos",
  "coordinates": {
    "latitude": 39.8017,
    "longitude": -89.6436
  }
}
```

#### `LocationSuggestionsResponse` — envelope de sucesso da busca de localidades

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `suggestions` | `LocationSuggestion[]` | sim | Lista ordenada pelo provedor, limitada a cinco itens. |

```text
{
  "suggestions": [
    {
      "city": "Springfield",
      "administrativeArea": "Illinois",
      "country": "Estados Unidos",
      "coordinates": {
        "latitude": 39.8017,
        "longitude": -89.6436
      }
    }
  ]
}
```

> **Lista vazia:** ausência de correspondências é sucesso, não erro.

```text
{
  "suggestions": []
}
```

#### `WeatherRequest` — corpo da consulta meteorológica

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `location` | `LocationSuggestion` | sim | Sugestão escolhida no combobox. |

```text
{
  "location": {
    "city": "Springfield",
    "administrativeArea": "Illinois",
    "country": "Estados Unidos",
    "coordinates": {
      "latitude": 39.8017,
      "longitude": -89.6436
    }
  }
}
```

#### `WeatherResponse` — resposta meteorológica existente e inalterada

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `location` | `WeatherLocation` | sim | Cidade, divisão administrativa anulável e país selecionados. |
| `current` | `CurrentConditions` | sim | Temperatura, sensação, condição, umidade e vento. |
| `units` | `WeatherUnits` | sim | Unidades métricas já exibidas pelo painel. |
| `source` | `SourceAttribution` | sim | Atribuição existente da Open-Meteo. |

```text
{
  "location": {
    "city": "Springfield",
    "administrativeArea": "Illinois",
    "country": "Estados Unidos"
  },
  "current": {
    "temperature": 18.4,
    "apparentTemperature": 17.9,
    "condition": "Parcialmente nublado",
    "relativeHumidity": 64,
    "windSpeed": 11.2
  },
  "units": {
    "temperature": "°C",
    "apparentTemperature": "°C",
    "relativeHumidity": "%",
    "windSpeed": "km/h"
  },
  "source": {
    "name": "Open-Meteo",
    "url": "https://open-meteo.com/",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
  }
}
```

#### `LocationSearchState` — estados da busca de sugestões no frontend

| Variante | Campos | Descrição |
| --- | --- | --- |
| `idle` | `status` | Campo inativo, insuficiente ou lista dispensada. |
| `loading` | `status`, `query` | Debounce concluído e requisição atual em andamento. |
| `success` | `status`, `query`, `suggestions` | Resposta atual, inclusive lista vazia. |
| `error` | `status`, `query`, `error` | Falha da busca atual pronta para feedback. |

```text
{
  "status": "success",
  "query": "spri",
  "suggestions": []
}
```

#### `ApiError` — envelope de erro

| Código | HTTP | Significado |
| --- | --- | --- |
| `INVALID_LOCATION_QUERY` | `400` | `query` ausente, repetida ou com menos de dois caracteres úteis. |
| `LOCATION_SERVICE_UNAVAILABLE` | `503` | Timeout, rede, status não exitoso ou payload inválido na busca de localidades. |
| `INVALID_LOCATION` | `400` | Corpo da seleção ausente ou com textos/coordenadas inválidos. |
| `WEATHER_SERVICE_UNAVAILABLE` | `503` | Timeout, rede, status não exitoso ou payload inválido na previsão. |
| `INTERNAL_ERROR` | `500` | Falha inesperada sem detalhes internos no corpo. |

```text
{
  "error": {
    "code": "LOCATION_SERVICE_UNAVAILABLE",
    "message": "Não foi possível buscar localidades agora. Tente novamente."
  }
}
```

As mensagens públicas serão estáveis e em português do Brasil. Respostas da Open-Meteo, URLs, queries e causas internas não serão expostas ao cliente.

#### Mapeamento Geocoding API → contrato

| Origem (Open-Meteo) | Destino (contrato) |
| --- | --- |
| `results[].name` | `suggestions[].city` |
| primeiro texto não vazio entre `admin1`, `admin2`, `admin3`, `admin4` | `suggestions[].administrativeArea` |
| `results[].country` | `suggestions[].country` |
| `results[].latitude` | `suggestions[].coordinates.latitude` |
| `results[].longitude` | `suggestions[].coordinates.longitude` |

O envelope sem `results` e qualquer item entre os cinco retornados sem cidade, país ou coordenadas válidas serão tratados como indisponibilidade externa. `results: []` será preservado como lista vazia.

#### Mapeamento seleção → previsão e resposta

| Origem (`WeatherRequest`) | Destino |
| --- | --- |
| `location.coordinates.latitude` | parâmetro `latitude` da previsão |
| `location.coordinates.longitude` | parâmetro `longitude` da previsão |
| `location.city` | `WeatherResponse.location.city` |
| `location.administrativeArea` | `WeatherResponse.location.administrativeArea` |
| `location.country` | `WeatherResponse.location.country` |

#### Parâmetros fixos na origem

| API | Parâmetros principais |
| --- | --- |
| **Geocoding API** | `name=<query normalizada>`, `count=5`, `language=pt`, `format=json` |
| **Weather Forecast API** | `latitude=<lat>`, `longitude=<lon>`, `current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m`, `temperature_unit=celsius`, `wind_speed_unit=kmh` |

Não haverá banco de dados. Query, sugestões e seleção existirão somente no estado atual da interface e durante as requisições necessárias.

### Endpoints da API (se aplicável)

#### Visão geral

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/locations` | Busca até cinco sugestões globais de localidade. |
| `POST` | `/weather` | Consulta o clima pelas coordenadas da localidade selecionada. |
| `GET` | `/health` | Preserva o liveness check do backend. |

---

#### `GET /locations`

Busca sugestões ordenadas pela Open-Meteo. A operação é idempotente e não persiste a query.

**Parâmetros de consulta**

| Parâmetro | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| `query` | `string` | — | Obrigatório e único; aplica `trim`, colapso de espaços internos e exige dois caracteres Unicode alfanuméricos úteis. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `LocationSuggestionsResponse` | A origem responde com zero a cinco localidades válidas. |
| `400` | `ApiError` | `query` está ausente, repetida ou inválida. |
| `503` | `ApiError` | A origem falha, excede o timeout ou devolve payload inválido. |
| `500` | `ApiError` | Ocorre falha interna inesperada. |

**Exemplo — sucesso**

```http
GET /locations?query=spri
```

O corpo é o exemplo de `LocationSuggestionsResponse` documentado em “Modelos de dados”. A resposta incluirá `Cache-Control: no-store`.

**Exemplo — nenhuma correspondência**

```http
GET /locations?query=zzzzzz
```

```text
{
  "suggestions": []
}
```

> A interface manterá o campo editável e mostrará “Nenhuma localidade encontrada”. A lista voltará a ser consultada quando a query mudar.

**Exemplo — erro de validação**

```http
GET /locations?query=a
```

```text
{
  "error": {
    "code": "INVALID_LOCATION_QUERY",
    "message": "Informe ao menos dois caracteres para buscar uma localidade."
  }
}
```

**Exemplo — indisponibilidade externa**

```text
{
  "error": {
    "code": "LOCATION_SERVICE_UNAVAILABLE",
    "message": "Não foi possível buscar localidades agora. Tente novamente."
  }
}
```

---

#### `POST /weather`

Consulta condições atuais para a sugestão escolhida. Embora use `POST` para transportar um objeto estruturado, a operação não produz efeitos persistentes e não requer chave de idempotência.

**Corpo**

| Campo | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| `location` | `LocationSuggestion` | — | Obrigatório; textos não vazios, `administrativeArea` textual ou `null` e coordenadas nos limites WGS84. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `WeatherResponse` | Localidade e resposta meteorológica são válidas. |
| `400` | `ApiError` | O corpo ou a localidade são inválidos. |
| `503` | `ApiError` | A previsão falha, excede o timeout ou devolve payload inválido. |
| `500` | `ApiError` | Ocorre falha interna inesperada. |

**Exemplo — sucesso**

```http
POST /weather
Content-Type: application/json
```

O corpo da requisição é o exemplo de `WeatherRequest`, e o corpo da resposta é o exemplo de `WeatherResponse`. A resposta incluirá `Cache-Control: no-store`.

**Exemplo — seleção inválida**

```text
{
  "location": {
    "city": "Springfield",
    "administrativeArea": "Illinois",
    "country": "Estados Unidos",
    "coordinates": {
      "latitude": 200,
      "longitude": -89.6436
    }
  }
}
```

```text
{
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Selecione uma localidade válida."
  }
}
```

> O backend devolverá no resultado os rótulos da seleção validada e usará exatamente as coordenadas dessa seleção na previsão.

---

#### `GET /health`

Preserva a verificação local do processo sem consultar dependências externas.

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `{ status: "healthy", timestamp: string }` | O processo Express responde. |

**Exemplo — sucesso**

```http
GET /health
```

```text
{
  "status": "healthy",
  "timestamp": "2026-08-05T15:00:00.000Z"
}
```

---

## Pontos de integração

- **Geocoding API da Open-Meteo:** o endpoint configurado em `OPEN_METEO_GEOCODING_URL` receberá `count=5`, `language=pt` e `format=json`. Duas letras só produzem correspondência exata; a partir de três, a origem usa correspondência normalizada por prefixo. Referência: [documentação oficial de geocodificação](https://open-meteo.com/en/docs/geocoding-api).
- **Weather Forecast API:** a integração existente continuará consultando somente as condições atuais e unidades métricas pelas coordenadas selecionadas. Referência: [documentação oficial da previsão](https://open-meteo.com/en/docs).
- **Autenticação:** nenhuma API key nova será adicionada no escopo não comercial atual. URLs permanecem configuráveis pelas variáveis já existentes.
- **Timeout:** cada caso de uso criará um `AbortController` com o orçamento existente de 2.500 ms. O timeout é limite de falha; não substitui a meta de 500 ms das sugestões.
- **Cancelamento:** o frontend abortará a requisição anterior quando a query mudar ou o componente desmontar e também comparará a identidade da requisição antes de alterar estado. O backend encerrará sua chamada externa no timeout configurado.
- **Falhas:** rede, `429`, demais status não exitosos, JSON inválido ou campos obrigatórios ausentes serão normalizados no erro `503` específico da operação.
- **Retry e cache:** não haverá retry nem cache. `Cache-Control: no-store` será enviado nas respostas de localidades e clima.
- **Atribuição:** a atribuição existente da Open-Meteo/CC BY 4.0 continuará junto ao resultado meteorológico; os dados de geocodificação são baseados em GeoNames conforme a documentação oficial.

## Abordagem de testes

Frontend e backend continuarão usando Vitest, com cobertura mínima de 80% para linhas, funções, branches e statements. Os testes seguirão FIRST e AAA ou Given/When/Then; rede externa será substituída por stubs determinísticos. Playwright permanecerá em `e2e/` e cobrirá somente fluxos completos críticos.

### Testes de unidade (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-BE-01 | Normaliza query e aplica o limite mínimo | CA-01, CA-02 | Espaços são normalizados; zero ou um caractere útil falha antes do provedor e dois seguem para a busca. |
| TU-BE-02 | Mapeia até cinco sugestões e região anulável | CA-01, CA-03 | A lista preserva a ordem, limita cinco itens e produz cidade, região ou `null`, país e coordenadas. |
| TU-BE-03 | Diferencia lista vazia de payload inválido | CA-08, CA-09 | `results: []` vira sucesso vazio; envelope ou item inválido vira indisponibilidade. |
| TU-BE-04 | Pesquisa localidades com parâmetros fixos e timeout | CA-01, CA-09, CA-11 | O cliente envia `count=5`, idioma e formato corretos, não repete a chamada e aborta no orçamento. |
| TU-BE-05 | Valida a localidade selecionada | CA-04 | Textos, nulabilidade e limites WGS84 válidos são aceitos; demais corpos falham como `INVALID_LOCATION`. |
| TU-BE-06 | Consulta a previsão com as coordenadas exatas | CA-04 | O serviço chama somente a previsão, preserva os rótulos selecionados e não geocodifica novamente. |
| TU-FE-01 | Interpreta sucesso, vazio e erro de localidades | CA-01, CA-08, CA-09 | O serviço aceita o contrato válido e normaliza respostas malformadas ou não exitosas. |
| TU-FE-02 | Aplica debounce e evita chamada abaixo do mínimo | CA-01, CA-02, CA-07, CA-11 | Com relógio controlado, a chamada começa uma vez após 200 ms e expõe loading sem apagar a query. |
| TU-FE-03 | Ignora respostas obsoletas | CA-10 | A requisição anterior é abortada e não altera o estado após uma query mais nova. |
| TU-FE-04 | Expõe a semântica do combobox | CA-03, CA-12 | Campo, lista, opções, estado expandido, item ativo e feedback possuem papéis, nomes e relações ARIA corretos. |
| TU-FE-05 | Navega e seleciona por teclado | CA-06 | Setas mudam a opção ativa, Enter seleciona e Escape fecha sem apagar o texto. |
| TU-FE-06 | Seleciona por ponteiro e fecha a lista | CA-05 | Clique ou evento de ponteiro escolhe a opção, mantém a interação válida e fecha o popup. |
| TU-FE-07 | Envia a seleção estruturada ao clima | CA-04, CA-05 | O hook inicia `POST /weather` uma vez com os rótulos e coordenadas da opção escolhida. |

Os parsers do backend receberão `unknown` e cobrirão limites numéricos, campos omitidos, arrays vazios e itens inválidos. O frontend usará Testing Library, `user-event`, fake timers e consultas por papel/nome acessível, sem assertions sobre classes Tailwind.

### Testes de integração (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-BE-01 | Retorna até cinco localidades com `no-store` | CA-01, CA-03 | Supertest recebe o contrato 200 ordenado e cada sugestão tem os campos de exibição. |
| TI-BE-02 | Rejeita query insuficiente sem chamar o provedor | CA-02 | `GET /locations` retorna 400 estável e o stub não é executado. |
| TI-BE-03 | Retorna sucesso vazio | CA-08 | Ausência de correspondências retorna 200 com `suggestions: []`. |
| TI-BE-04 | Normaliza falha da origem de localidades | CA-09 | Rede, timeout, status não exitoso e JSON inválido retornam `LOCATION_SERVICE_UNAVAILABLE`. |
| TI-BE-05 | Consulta clima para a homônima escolhida | CA-04 | `POST /weather` usa exatamente as coordenadas do corpo e identifica os mesmos rótulos na resposta. |
| TI-BE-06 | Rejeita seleção inválida antes da previsão | CA-04 | Coordenada ou rótulo inválido retorna 400 e não chama a origem. |
| TI-FE-01 | Integra autocomplete, seleção e clima | CA-04, CA-05, CA-07, CA-10 | A view mostra loading, descarta resultados antigos, fecha a lista e inicia a consulta da opção selecionada. |

Os testes do backend criarão a aplicação com um `WeatherProvider` stub e Supertest, sem `listen` e sem rede real. Os testes do frontend substituirão apenas `fetch` na fronteira dos serviços.

### Testes E2E (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | Escolhe uma cidade homônima por ponteiro | CA-01, CA-03, CA-04, CA-05 | Até cinco sugestões aparecem, a opção escolhida fecha a lista e o resultado identifica a localidade exata. |
| E2E-02 | Opera o combobox somente por teclado | CA-06, CA-12 | Setas, Enter e Escape funcionam; foco, item ativo, lista e mensagens são expostos semanticamente. |
| E2E-03 | Trata mínimo, vazio e indisponibilidade | CA-02, CA-08, CA-09 | Menos de dois caracteres não chama a API; vazio e erro são anunciados e uma edição permite tentar novamente. |
| E2E-04 | Mantém somente a resposta da query atual | CA-10 | Respostas controladas fora de ordem nunca exibem sugestões antigas. |
| E2E-05 | Mede o p95 das sugestões | CA-11 | Em 20 amostras, pelo menos 95% aparecem em até 500 ms desde a última digitação. |
| E2E-06 | Mantém o autocomplete responsivo | CA-13 | Em 360 px e 1280 px, lista e opções ficam legíveis e não causam overflow horizontal. |

O mock da Open-Meteo oferecerá homônimas com coordenadas diferentes, lista vazia, erro e respostas com atrasos invertidos. E2E-05 usará o mock determinístico no CI e terá uma rodada real opcional em QA. A medição real registrará data, rede, amostras e p95; indisponibilidade externa não tornará o teste determinístico instável, mas um p95 real acima de 500 ms exigirá análise antes da aprovação do CA-11.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Definir os tipos compartilhados, novos erros e testes de contrato, fixando os limites antes de alterar o fluxo existente.
2. Refatorar o parser e o `WeatherProvider`, implementar `SearchLocations` e expor `GET /locations` com testes unitários e de integração.
3. Validar a seleção estruturada, alterar `GetCurrentWeather` e substituir `GET /weather?city` por `POST /weather`.
4. Criar os serviços HTTP e hooks do frontend, incluindo debounce, cancelamento e proteção contra respostas obsoletas.
5. Criar os componentes pequenos do combobox, conectá-los à `WeatherView` e remover o formulário/botão antigo.
6. Adaptar o mock da Open-Meteo e os E2E para homônimas, teclado, falhas, responsividade e desempenho.
7. Executar cobertura, testes, lint, typecheck e builds de cada aplicação; executar a suíte Playwright por último.

### Dependências técnicas

- Não será adicionada dependência de produção ou desenvolvimento.
- React 19, `fetch`, `AbortController`, Tailwind CSS, Vitest, Testing Library e Playwright existentes são suficientes.
- A Geocoding API e a Weather Forecast API da Open-Meteo precisam estar disponíveis para uso real; testes automatizados usarão o mock local.
- `OPEN_METEO_GEOCODING_URL`, `OPEN_METEO_FORECAST_URL` e `OPEN_METEO_TIMEOUT_MS` existentes serão reutilizadas sem nova variável de ambiente.
- O endpoint `GET /weather?city` será removido; não há cliente externo identificado que exija compatibilidade.

## Monitoramento e observabilidade

- `GET /health` continuará como liveness check e não consultará a Open-Meteo.
- O backend emitirá `location_suggestions_completed` em nível `info`, com `status`, `result`, `resultCount` e `durationMs`.
- Falha de sugestões emitirá `location_suggestions_failed` em nível `error`, com `status`, `cause`, `dependency` e `durationMs`.
- A consulta meteorológica preservará os eventos atuais de sucesso e falha, adaptados ao novo fluxo sem geocodificação intermediária.
- Query, nomes de localidades, coordenadas e payloads externos não serão registrados, reduzindo exposição desnecessária de dados de uso.
- O MVP não adicionará telemetria no navegador. O p95 de 500 ms será protegido pelo teste controlado e medido na rodada real de QA; observabilidade de produção exigirá uma iniciativa futura de métricas frontend.

## Considerações técnicas

### Principais decisões

- **Endpoint separado para sugestões:** `GET /locations` mantém a pesquisa idempotente e separa geocodificação da previsão.
- **Seleção estruturada em `POST /weather`:** evita uma segunda geocodificação, garante que a interface envie as coordenadas escolhidas e simplifica o fluxo de homônimas.
- **Substituição do contrato antigo:** manter `GET /weather?city` preservaria a escolha silenciosa do primeiro resultado e duplicaria fluxos; ele será removido por não haver consumidor externo conhecido.
- **Debounce de 200 ms:** reduz chamadas durante digitação e reserva até 300 ms do objetivo de 500 ms para frontend, backend e origem sob condições normais.
- **Combobox próprio sem biblioteca:** a interface é pequena e os recursos existentes bastam; serão seguidos o [padrão oficial de combobox do WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) e seus requisitos de teclado e foco.
- **Effect apenas para sincronização externa:** timer, requisição e cancelamento ficarão em `useLocationSuggestions`; estado derivado e interação de seleção permanecerão fora do Effect, conforme a [documentação do React](https://react.dev/reference/react/useEffect).
- **Seleção como pausa da busca:** escolher uma opção preencherá o campo, marcará a seleção e chamará o hook com `enabled=false`; a próxima edição limpará a seleção e reativará as sugestões. Isso evita reabrir a lista com o texto preenchido.
- **Sem cache e retry:** reduz complexidade, evita sugestões antigas e mantém consumo e latência previsíveis no MVP.
- **Sem identificador persistente:** coordenadas e rótulos já retornados pelo backend são suficientes no escopo atual; resolver novamente um ID aumentaria latência e chamadas externas.

### Riscos conhecidos

- **Meta de 500 ms dependente da rede e do provedor:** o debounce deixa 300 ms para a cadeia externa. Mitigação: payload pequeno, uma chamada externa, cancelamento, teste controlado e medição real de QA.
- **Duas letras têm busca restrita na origem:** a Open-Meteo só faz correspondência exata com dois caracteres e prefixo a partir de três. Mitigação: tratar lista vazia normalmente e permitir continuar digitando.
- **Volume de chamadas durante digitação:** cancelamento no navegador não garante que uma requisição já recebida pelo backend deixe de consumir a origem. Mitigação: debounce, limite de cinco, ausência de retry e monitoramento de duração/falhas.
- **Rótulos e coordenadas vêm do cliente no segundo passo:** um cliente fora da interface pode enviar combinações inconsistentes, embora não haja escrita, autenticação ou decisão sensível. Mitigação: validação estrita; se o contrato ganhar impacto de segurança, trocar por identificador do provedor resolvido no backend.
- **Combobox acessível exige sincronização cuidadosa:** blur, ponteiro, teclado e `aria-activedescendant` podem divergir. Mitigação: foco mantido no input, hooks separados e testes de componente e E2E por papel acessível.
- **Mudança incompatível no endpoint de clima:** consumidores não identificados de `GET /weather?city` deixariam de funcionar. Mitigação: confirmar novamente os consumidores antes da implementação e documentar `POST /weather`.

### Conformidade com o AGENTS.md e as rules

Foram lidos integralmente `AGENTS.md` e todos os arquivos em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- Frontend e backend permanecerão aplicações independentes, com comandos executados em seus respectivos diretórios.
- O fluxo respeitará `view → components/hooks → services → backend` e `request → routes → services → data`.
- Cada tipo ficará em arquivo próprio; arquivos TypeScript terão até 100 linhas, componentes/funções até 30 linhas e no máximo três parâmetros, usando objetos quando necessário.
- O código usará TypeScript estrito, `unknown` nas fronteiras, sem `any`, sem mutação, com comparações estritas e constantes para debounce, limites e mensagens.
- I/O do backend continuará assíncrono, sem bloqueio do event loop, URLs e timeout configuráveis, logging centralizado e sem referências circulares.
- Todo código novo ou alterado terá testes automatizados. Vitest manterá mínimo de 80% em linhas, funções, branches e statements; Playwright ficará em `e2e/`.
- Na implementação, serão executados `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` no frontend; `npm run build`, `npm test` e `npm run test:coverage` no backend; e `npm test` em `e2e/`.

Não há desvio planejado das regras. A observação desatualizada do `AGENTS.md` sobre ausência de framework de testes no frontend não altera a decisão, pois o repositório já contém Vitest, scripts e limiares de cobertura configurados.

### Conformidade com skills

- `react` — aplicada à separação entre componentes, hooks e serviços; ao uso de Effect somente para timer/requisição com cleanup; à fonte única de verdade; às props explícitas; à semântica acessível; e à estilização responsiva com Tailwind CSS.

Não há desvio planejado da skill aplicável.

### Arquivos relevantes e dependentes

Documentação:

- `tasks/prd-autocomplete-localidade/prd.md`
- `tasks/prd-autocomplete-localidade/techspec.md`
- `tasks/prd-painel-de-clima/techspec.md`
- `AGENTS.md`
- `.agents/rules/*.md`
- `.agents/skills/react/SKILL.md` e referências aplicáveis

Backend:

- `backend/src/app.ts`
- `backend/src/routes/locations-route.ts` (novo)
- `backend/src/routes/weather-route.ts`
- `backend/src/services/normalize-location-query.ts` (novo; substitui `normalize-city.ts`)
- `backend/src/services/validate-selected-location.ts` (novo)
- `backend/src/services/search-locations.ts` (novo)
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
- `backend/src/types/location-suggestion.ts` (novo)
- `backend/src/types/location-suggestions-response.ts` (novo)
- Testes próximos aos módulos e `backend/src/weather-route.test.ts`

Frontend:

- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/LocationAutocomplete.tsx` (novo)
- `frontend/src/components/LocationSuggestionsList.tsx` (novo)
- `frontend/src/components/LocationSuggestionFeedback.tsx` (novo)
- `frontend/src/components/WeatherSearchForm.tsx` (removido)
- `frontend/src/hooks/useLocationSuggestions.ts` (novo)
- `frontend/src/hooks/useComboboxNavigation.ts` (novo)
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/location-service.ts` (novo)
- `frontend/src/services/weather-service.ts`
- `frontend/src/types/location-suggestion.ts` (novo)
- `frontend/src/types/location-search-state.ts` (novo)
- `frontend/src/types/api-error.ts`
- Testes `*.test.ts` e `*.test.tsx` próximos aos módulos afetados

E2E e configuração:

- `backend/.env.example`
- `frontend/.env.example`
- `backend/vitest.config.ts`
- `frontend/vitest.config.ts`
- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
- `e2e/real-performance.spec.ts`
- `e2e/playwright.config.ts`
