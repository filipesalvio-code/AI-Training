# Especificação técnica

## Resumo

A solução adicionará `GET /weather?city=...` ao backend Express. A rota validará a cidade, delegará a um serviço de aplicação a resolução da primeira localidade na Geocoding API da Open-Meteo e, em seguida, consultará as condições atuais na Weather Forecast API. O backend validará respostas externas recebidas como `unknown`, traduzirá o código WMO para português do Brasil e devolverá ao frontend um contrato reduzido, estável e pronto para exibição. Não haverá banco, histórico, cache, retry automático nem chamadas à Open-Meteo pelo navegador.

No frontend, `App` passará a compor uma view de clima sem o indicador periódico de saúde existente. A view usará componentes pequenos, um hook para a máquina de estados da consulta e um serviço exclusivo para acesso ao backend. `GET /health` continuará disponível no servidor como liveness check. O orçamento total das duas chamadas externas será de 2,5 segundos; falhas externas serão normalizadas como indisponibilidade temporária. Testes determinísticos usarão dependências controladas, enquanto a meta fim a fim do CA-09 também será medida contra a Open-Meteo real em QA.

## Arquitetura do sistema

### Visão dos componentes

Fluxo principal:

```text
WeatherView
  → useWeatherSearch
    → weatherService
      → GET /weather?city=...
        → weatherRoute
          → getCurrentWeather
            → OpenMeteoClient.searchFirstLocation
            → OpenMeteoClient.getCurrentConditions
          → WeatherResponse
```

Componentes novos ou modificados no backend:

- `src/index.ts` — modificado para carregar configuração, iniciar o servidor e executar graceful shutdown idempotente; não conterá rotas nem regras de negócio.
- `src/app.ts` — nova composição do Express, com CORS, parsers, `/health`, `/weather` e middleware de erro; receberá dependências para permitir testes sem abrir uma porta.
- `src/config/environment.ts` — nova leitura e validação de `PORT`, `CORS_ORIGIN`, `OPEN_METEO_GEOCODING_URL`, `OPEN_METEO_FORECAST_URL` e `OPEN_METEO_TIMEOUT_MS`.
- `src/routes/health-route.ts` — extrairá e preservará o contrato atual de `GET /health`.
- `src/routes/weather-route.ts` — lerá `city`, aplicará validação HTTP básica, chamará o caso de uso e serializará a resposta.
- `src/services/normalize-city.ts` — removerá espaços excedentes e validará ao menos dois caracteres Unicode alfanuméricos úteis.
- `src/services/get-current-weather.ts` — orquestrará geocodificação, seleção do primeiro resultado, consulta meteorológica e montagem do contrato público.
- `src/services/weather-condition.ts` — mapeará exaustivamente códigos WMO conhecidos para descrições em português do Brasil.
- `src/data/open-meteo-client.ts` — implementará as duas chamadas HTTPS com `fetch` nativo, um sinal de cancelamento comum e parâmetros fixos.
- `src/data/parse-geocoding-response.ts` e `src/data/parse-forecast-response.ts` — validarão payloads externos antes de convertê-los em tipos internos.
- `src/errors/app-error.ts` — representará erros esperados por código e status HTTP.
- `src/middleware/error-handler.ts` — converterá erros esperados no envelope público e ocultará detalhes de falhas inesperadas.
- `src/observability/logger.ts` — centralizará logs estruturados sem registrar a cidade pesquisada.
- `src/types/*.ts` — manterá cada contrato compartilhado em arquivo próprio, conforme as regras do projeto.

Componentes novos ou modificados no frontend:

- `src/App.tsx` — modificado para compor somente a experiência do painel; removerá o polling e o indicador de saúde.
- `src/views/WeatherView.tsx` — coordenará formulário, feedback e resultado sem realizar acesso HTTP direto.
- `src/components/WeatherSearchForm.tsx` — exibirá campo rotulado, validação associada e botão com estados de foco e desabilitado.
- `src/components/WeatherFeedback.tsx` — anunciará carregamento, validação e erros por região viva.
- `src/components/WeatherResult.tsx` — apresentará localidade e todas as condições atuais com rótulos textuais.
- `src/components/SourceAttribution.tsx` — exibirá a atribuição e os links da Open-Meteo e da licença junto ao resultado.
- `src/hooks/useWeatherSearch.ts` — manterá uma única fonte de verdade para `idle`, `loading`, `success` e `error`, impedirá submissão duplicada e ignorará respostas obsoletas após desmontagem.
- `src/services/weather-service.ts` — será o único módulo do frontend que conhece `VITE_API_BASE_URL` e o contrato de `GET /weather`.
- `src/types/*.ts` — conterá, em arquivos próprios, resposta, erro e estado da busca.
- `src/index.css` — ajustará apenas tokens e estilos base que não possam ser expressos por utilitários Tailwind.
- `index.html` — definirá `lang="pt-BR"` e um título coerente com o painel.

Relações e limites:

- O frontend conhece somente o contrato público do backend.
- A rota conhece o serviço, o serviço conhece a interface do provedor e a camada `data` implementa essa interface.
- O cliente Open-Meteo não importa Express, rotas ou componentes.
- Nenhuma camada persiste a cidade; a resposta usará `Cache-Control: no-store`.
- O health check não consultará dependências externas e não será exibido no frontend.

## Design de implementação

### Principais interfaces

```text
WeatherProvider
  searchFirstLocation(city, signal) -> Promise<ResolvedLocation | null>
  getCurrentConditions(coordinates, signal) -> Promise<ProviderConditions>
```

```text
GetCurrentWeather
  execute(city) -> Promise<WeatherResponse>

WeatherService (frontend)
  search(city, signal) -> Promise<WeatherResponse>
```

`GetCurrentWeather` iniciará um único orçamento de 2.500 ms antes da geocodificação e compartilhará o mesmo `AbortSignal` com a previsão. O tempo gasto na primeira chamada reduzirá o tempo disponível para a segunda. Não haverá retry automático, pois ele ampliaria a latência e o consumo do limite gratuito.

### Modelos de dados

#### `Coordinates` — coordenadas internas da localidade resolvida

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `latitude` | `number` | sim | Latitude WGS84 validada. |
| `longitude` | `number` | sim | Longitude WGS84 validada. |

```text
{
  "latitude": -23.5475,
  "longitude": -46.6361
}
```

#### `ResolvedLocation` — primeira localidade válida retornada pela geocodificação

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `city` | `string` | sim | Nome localizado da cidade. |
| `administrativeArea` | `string \| null` | sim | Primeira divisão disponível na ordem `admin1` → `admin2` → `admin3` → `admin4`. |
| `country` | `string` | sim | País localizado. |
| `coordinates` | `Coordinates` | sim | Coordenadas usadas na previsão. |

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

> **Degradação de divisão administrativa:** a ausência de todas as divisões administrativas não invalida a consulta; o campo público obrigatório é normalizado para `null`.

```text
{
  "administrativeArea": null
}
```

#### `ProviderConditions` — condições validadas antes da tradução e exposição

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `temperature` | `number` | sim | Temperatura em graus Celsius. |
| `apparentTemperature` | `number` | sim | Sensação térmica em graus Celsius. |
| `weatherCode` | `number` | sim | Código WMO inteiro conhecido. |
| `relativeHumidity` | `number` | sim | Umidade relativa entre 0 e 100. |
| `windSpeed` | `number` | sim | Velocidade não negativa em km/h. |

```text
{
  "temperature": 24.3,
  "apparentTemperature": 25.1,
  "weatherCode": 2,
  "relativeHumidity": 72,
  "windSpeed": 12.4
}
```

#### `WeatherLocation` — localização pronta para o frontend

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `city` | `string` | sim | Cidade efetivamente selecionada. |
| `administrativeArea` | `string \| null` | sim | Divisão administrativa disponível ou `null`. |
| `country` | `string` | sim | País da localidade. |

```text
{
  "city": "São Paulo",
  "administrativeArea": "São Paulo",
  "country": "Brasil"
}
```

#### `CurrentConditions` — dados atuais prontos para exibição

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `temperature` | `number` | sim | Temperatura atual. |
| `apparentTemperature` | `number` | sim | Sensação térmica atual. |
| `condition` | `string` | sim | Descrição do código WMO em português do Brasil. |
| `relativeHumidity` | `number` | sim | Umidade relativa. |
| `windSpeed` | `number` | sim | Velocidade do vento. |

```text
{
  "temperature": 24.3,
  "apparentTemperature": 25.1,
  "condition": "Parcialmente nublado",
  "relativeHumidity": 72,
  "windSpeed": 12.4
}
```

#### `WeatherUnits` — unidades explícitas do contrato

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `temperature` | `"°C"` | sim | Unidade de temperatura. |
| `apparentTemperature` | `"°C"` | sim | Unidade de sensação térmica. |
| `relativeHumidity` | `"%"` | sim | Unidade de umidade. |
| `windSpeed` | `"km/h"` | sim | Unidade de velocidade do vento. |

```text
{
  "temperature": "°C",
  "apparentTemperature": "°C",
  "relativeHumidity": "%",
  "windSpeed": "km/h"
}
```

#### `SourceAttribution` — metadados de atribuição

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `name` | `"Open-Meteo"` | sim | Nome da fonte. |
| `url` | `string` | sim | Link para a Open-Meteo. |
| `license` | `"CC BY 4.0"` | sim | Identificação da licença. |
| `licenseUrl` | `string` | sim | Link para as condições da licença. |

```text
{
  "name": "Open-Meteo",
  "url": "https://open-meteo.com/",
  "license": "CC BY 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
}
```

#### `WeatherResponse` — contrato agregado de sucesso entre backend e frontend

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `location` | `WeatherLocation` | sim | Localidade resolvida. |
| `current` | `CurrentConditions` | sim | Condições atuais. |
| `units` | `WeatherUnits` | sim | Unidades dos valores. |
| `source` | `SourceAttribution` | sim | Atribuição exibida com o resultado. |

```text
{
  "location": {
    "city": "São Paulo",
    "administrativeArea": "São Paulo",
    "country": "Brasil"
  },
  "current": {
    "temperature": 24.3,
    "apparentTemperature": 25.1,
    "condition": "Parcialmente nublado",
    "relativeHumidity": 72,
    "windSpeed": 12.4
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

Não haverá sucesso parcial para condições atuais: ausência, tipo inválido, unidade inesperada ou código WMO desconhecido produzirá `WEATHER_SERVICE_UNAVAILABLE`, pois todos os campos são obrigatórios em uma consulta bem-sucedida.

#### `ApiError` — envelope de erro

| Código | HTTP | Significado |
| --- | --- | --- |
| `INVALID_CITY` | `400` | Parâmetro ausente, repetido ou com menos de dois caracteres Unicode alfanuméricos após normalização. |
| `CITY_NOT_FOUND` | `404` | Geocodificação válida sem localidade correspondente. |
| `WEATHER_SERVICE_UNAVAILABLE` | `503` | Timeout, falha de rede, limite, status não exitoso ou payload inválido de qualquer dependência externa. |
| `INTERNAL_ERROR` | `500` | Erro inesperado do servidor, sem exposição de detalhes internos. |

```text
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "Cidade não encontrada. Verifique o nome e tente novamente."
  }
}
```

Mensagens públicas serão estáveis e em português do Brasil. Stack traces, URL externa, motivo bruto da Open-Meteo e detalhes do erro permanecerão apenas nos logs do servidor.

#### Mapeamento Geocoding API → contrato

| Origem (Open-Meteo) | Destino (contrato) |
| --- | --- |
| `results[0].name` | `location.city` |
| primeiro valor não vazio entre `admin1`, `admin2`, `admin3`, `admin4` | `location.administrativeArea` |
| `results[0].country` | `location.country` |
| `results[0].latitude` | `coordinates.latitude` interno |
| `results[0].longitude` | `coordinates.longitude` interno |

#### Mapeamento Weather Forecast API → contrato

| Origem (Open-Meteo) | Destino (contrato) |
| --- | --- |
| `current.temperature_2m` | `current.temperature` |
| `current.apparent_temperature` | `current.apparentTemperature` |
| `current.weather_code` | tradução → `current.condition` |
| `current.relative_humidity_2m` | `current.relativeHumidity` |
| `current.wind_speed_10m` | `current.windSpeed` |
| `current_units.*` validadas | `units.*` normalizadas |

#### Mapeamento de códigos WMO → português do Brasil

| Códigos | Descrição pública |
| --- | --- |
| `0` | Céu limpo |
| `1`, `2`, `3` | Predominantemente limpo, parcialmente nublado, encoberto |
| `45`, `48` | Neblina, neblina com geada |
| `51`, `53`, `55` | Garoa leve, moderada, forte |
| `56`, `57` | Garoa congelante leve, forte |
| `61`, `63`, `65` | Chuva fraca, moderada, forte |
| `66`, `67` | Chuva congelante leve, forte |
| `71`, `73`, `75` | Neve fraca, moderada, forte |
| `77` | Grãos de neve |
| `80`, `81`, `82` | Pancadas de chuva fracas, moderadas, fortes |
| `85`, `86` | Pancadas de neve fracas, fortes |
| `95` | Trovoada |
| `96`, `99` | Trovoada com granizo leve, forte |

#### Parâmetros fixos na origem

| API | Parâmetros principais |
| --- | --- |
| **Geocoding API** | `name=<cidade normalizada>`, `count=1`, `language=pt`, `format=json` |
| **Weather Forecast API** | `latitude=<lat>`, `longitude=<lon>`, `current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m`, `temperature_unit=celsius`, `wind_speed_unit=kmh` |

Não há esquema de banco de dados. A cidade existe somente no campo controlado do frontend, na requisição em andamento e na memória necessária para responder; não será criada funcionalidade de histórico.

### Endpoints da API (se aplicável)

#### Visão geral

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/weather` | Resolve uma cidade e retorna suas condições atuais. |
| `GET` | `/health` | Preserva o liveness check atual do backend. |

---

#### `GET /weather`

Resolve a primeira localidade retornada pela Open-Meteo e agrega suas condições atuais. Por ser uma leitura idempotente, não requer chave de idempotência.

**Parâmetros de consulta**

| Parâmetro | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| `city` | `string` | — | Obrigatório e único; `trim`, colapso de espaços internos e no mínimo dois caracteres Unicode alfanuméricos. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `WeatherResponse` | Primeira localidade e condições atuais foram validadas. |
| `400` | `ApiError` | `city` está ausente, repetida ou inválida. |
| `404` | `ApiError` | Não há localidade correspondente. |
| `503` | `ApiError` | Uma dependência externa não conclui corretamente no orçamento total. |
| `500` | `ApiError` | Ocorre uma falha inesperada interna. |

**Exemplo — sucesso**

```http
GET /weather?city=S%C3%A3o%20Paulo
```

O corpo é o exemplo de `WeatherResponse` documentado em “Modelos de dados”. A resposta incluirá `Cache-Control: no-store`.

**Exemplo — nenhuma correspondência**

```http
GET /weather?city=CidadeInexistente
```

```text
{
  "error": {
    "code": "CITY_NOT_FOUND",
    "message": "Cidade não encontrada. Verifique o nome e tente novamente."
  }
}
```

> O frontend limpará qualquer resultado anterior quando uma nova tentativa começar. Uma resposta `404` ou `503` nunca será exibida ao lado de dados da busca anterior.

**Exemplo — erro de validação**

```http
GET /weather?city=%20a%20
```

```text
{
  "error": {
    "code": "INVALID_CITY",
    "message": "Informe uma cidade com pelo menos dois caracteres."
  }
}
```

**Exemplo — indisponibilidade externa**

```text
{
  "error": {
    "code": "WEATHER_SERVICE_UNAVAILABLE",
    "message": "Não foi possível consultar o clima agora. Tente novamente em instantes."
  }
}
```

---

#### `GET /health`

Preserva o endpoint existente como verificação local do processo, sem consultar a Open-Meteo.

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `{ status: "healthy", timestamp: string }` | O processo Express está apto a responder. |

**Exemplo — sucesso**

```http
GET /health
```

```text
{
  "status": "healthy",
  "timestamp": "2026-08-02T15:00:00.000Z"
}
```

O endpoint será preservado para infraestrutura, mas o frontend não fará polling nem mostrará seu indicador.

---

## Pontos de integração

- **Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search`; usa o primeiro resultado com `count=1` e localização de nomes por `language=pt`. A resposta pode omitir campos administrativos, que serão normalizados. Referência: [documentação oficial de geocodificação](https://open-meteo.com/en/docs/geocoding-api).
- **Weather Forecast API:** `https://api.open-meteo.com/v1/forecast`; solicita apenas as cinco variáveis atuais necessárias e unidades métricas. Referência: [documentação oficial da previsão](https://open-meteo.com/en/docs).
- **Autenticação:** o MVP não usa API key por pressupor o serviço gratuito não comercial. As URLs ficam configuráveis para permitir migração ao endpoint comercial sem alterar regras de negócio.
- **Timeout:** um único `AbortController` limita a cadeia geocodificação → previsão a 2.500 ms. Timeout, erro DNS/TLS, `429`, demais respostas não exitosas, JSON inválido ou campo obrigatório ausente convergem para `503 WEATHER_SERVICE_UNAVAILABLE`.
- **Retry e cache:** não haverá retry nem cache no MVP. Isso mantém a latência previsível, evita associar respostas antigas a uma nova consulta e reduz complexidade. A decisão deverá ser reavaliada se volume ou SLO justificarem cache efêmero.
- **Limites e licença:** antes de cada release, os limites do plano gratuito devem ser reconfirmados nos [termos oficiais](https://open-meteo.com/en/terms). Em 2 de agosto de 2026, a página informa uso não comercial e limites inferiores a 600 chamadas/minuto, 5.000/hora, 10.000/dia e 300.000/mês. Como uma busca bem-sucedida usa duas chamadas, o monitoramento deve considerar ambas. A atribuição seguirá a [licença oficial](https://open-meteo.com/en/licence) e permanecerá visível junto aos dados.

## Abordagem de testes

Vitest será configurado separadamente no frontend e no backend, com limiares mínimos de 80% para linhas, funções, branches e statements. Os testes seguirão FIRST e AAA ou Given/When/Then. Rede externa será substituída por stubs determinísticos; somente mocks de fronteira serão usados. Playwright ficará em `e2e/`, como projeto de testes independente, e cobrirá poucos fluxos críticos. `npm test` será criado nos dois aplicativos e falhará quando a suíte falhar; `test:coverage` aplicará os limiares.

### Testes de unidade (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-BE-01 | Normaliza espaços e aceita nomes internacionais válidos | CA-01, CA-05 | A cidade normalizada preserva caracteres Unicode e pode seguir para a busca. |
| TU-BE-02 | Rejeita cidade ausente ou com menos de dois caracteres úteis | CA-05 | Retorna `INVALID_CITY` sem chamar o provedor. |
| TU-BE-03 | Seleciona somente o primeiro resultado da geocodificação | CA-01, CA-02 | O serviço usa a primeira coordenada e não cria etapa de seleção. |
| TU-BE-04 | Normaliza a divisão administrativa ausente | CA-02 | `administrativeArea` é o primeiro nível disponível ou `null`. |
| TU-BE-05 | Mapeia campos e unidades da previsão | CA-01, CA-03 | O contrato contém todos os valores obrigatórios em °C, %, e km/h. |
| TU-BE-06 | Traduz todos os códigos WMO conhecidos | CA-03 | Cada código produz a descrição pt-BR especificada. |
| TU-BE-07 | Rejeita payload externo inválido ou código desconhecido | CA-07 | O caso de uso falha como `WEATHER_SERVICE_UNAVAILABLE`. |
| TU-BE-08 | Encerra as duas chamadas no orçamento total sem retry | CA-07, CA-09 | O sinal é abortado em 2.500 ms e cada operação ocorre no máximo uma vez. |
| TU-FE-01 | Valida a cidade antes de chamar o serviço | CA-05 | Mostra orientação associada ao campo, limpa resultado e não faz requisição. |
| TU-FE-02 | Modela carregamento e bloqueia submissão duplicada | CA-08 | Formulário fica ocupado e uma segunda ação não inicia nova chamada. |
| TU-FE-03 | Apresenta sucesso completo e atribuição | CA-01, CA-02, CA-03, CA-13 | Localidade, cinco condições, unidades e links ficam visíveis. |
| TU-FE-04 | Apresenta cidade não encontrada e permite nova tentativa | CA-06 | Mensagem acionável é exibida e o campo volta a ficar operável. |
| TU-FE-05 | Limpa resultado anterior após falha externa | CA-07 | Nenhum dado antigo permanece; uma nova submissão pode ser feita. |
| TU-FE-06 | Expõe estados assíncronos por semântica acessível | CA-10, CA-11 | Rótulos, `aria-invalid`, `aria-describedby`, `role=status/alert` e `aria-busy` refletem o estado. |

O backend testará parsers com objetos `unknown`, limites numéricos, campos omitidos, arrays vazios, status externos e abortamento. O frontend usará Testing Library, `user-event` e `jest-dom`, consultando por papéis e nomes acessíveis em vez de classes CSS.

### Testes de integração (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-BE-01 | Retorna o contrato 200 e envia parâmetros mínimos à Open-Meteo | CA-01, CA-02, CA-03 | Supertest recebe `WeatherResponse`; o stub observa `count=1`, `language=pt`, variáveis atuais e unidades métricas. |
| TI-BE-02 | Rejeita query inválida sem acesso externo | CA-05 | `GET /weather` retorna 400 estável e o stub não é chamado. |
| TI-BE-03 | Converte geocodificação vazia em 404 | CA-06 | A previsão não é chamada e o envelope contém `CITY_NOT_FOUND`. |
| TI-BE-04 | Normaliza falhas das duas APIs em 503 | CA-07 | Rede, timeout, `429`, `5xx` e JSON inválido produzem o mesmo contrato público. |
| TI-BE-05 | Preserva o health check isolado | — | `/health` retorna o contrato atual e não chama o provedor. |
| TI-FE-01 | Integra hook, serviço e componentes nos quatro estados | CA-05, CA-06, CA-07, CA-08 | A UI transita entre idle, loading, success e error sem dados contraditórios. |

Os testes do backend criarão a aplicação com um `WeatherProvider` stub e Supertest, sem `listen` e sem rede real. Os testes do frontend substituirão apenas `fetch` na fronteira do serviço.

### Testes E2E (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | Pesquisa cidade e exibe o primeiro resultado completo | CA-01, CA-02, CA-03, CA-13 | O usuário vê localidade, valores, unidades e atribuição funcional. |
| E2E-02 | Garante que o navegador não chama a Open-Meteo | CA-04 | A captura de rede contém somente frontend e backend; qualquer host Open-Meteo falha o teste. |
| E2E-03 | Corrige entrada inválida sem requisição | CA-05 | A mensagem aparece, recebe foco/associação e nenhuma busca é enviada. |
| E2E-04 | Recupera-se de cidade não encontrada | CA-06 | O usuário altera a cidade e conclui nova consulta. |
| E2E-05 | Limpa sucesso anterior após indisponibilidade e permite retry | CA-07 | O dado anterior desaparece, a mensagem é anunciada e o retry pode ter sucesso. |
| E2E-06 | Exibe loading e impede envio duplicado | CA-08 | Uma resposta controlada pendente mantém feedback visível e somente uma requisição. |
| E2E-07 | Opera por teclado e anuncia mudanças de estado | CA-10, CA-11 | Ordem de foco, foco visível, submissão por teclado e regiões vivas funcionam sem mouse ou cor. |
| E2E-08 | Mantém layout operável em 360 px e 1280 px | CA-12 | Não há overflow horizontal e conteúdo/controles permanecem legíveis. |
| E2E-09 | Mede o orçamento fim a fim da consulta | CA-09 | Na automação controlada e na rodada real de QA, ao menos 95% das amostras exibem o resultado em até 3 s. |

No CI, E2E-09 usará respostas controladas para isolar o overhead da aplicação e permanecer repetível. Em QA, antes da liberação, o mesmo fluxo será executado em pelo menos 20 consultas distribuídas entre cidades de idiomas e regiões diferentes, com a Open-Meteo disponível e sem throttling artificial. O tempo será medido do envio do formulário à visibilidade do resultado; p95, amostra, data e condições da rede serão anexados ao relatório de QA. A rodada real não bloqueará a suíte determinística por uma indisponibilidade do provedor, mas CA-09 impedirá a aprovação funcional se o p95 observado exceder 3 segundos sem justificativa e reavaliação.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Configurar Vitest, cobertura de 80% e scripts `test`/`test:coverage` nos dois aplicativos; criar o projeto Playwright em `e2e/`. Isso estabelece a validação obrigatória antes do código funcional.
2. Extrair `app.ts`, `/health`, error handler, logger e inicialização/graceful shutdown, preservando o comportamento existente e eliminando os erros atuais de parâmetros não usados.
3. Definir tipos, erros, configuração de ambiente e interface `WeatherProvider`, fixando o contrato antes das integrações.
4. Implementar normalização, tradução WMO e caso de uso com testes unitários.
5. Implementar e testar o cliente Open-Meteo e seus parsers com stubs, timeout único e sem retry.
6. Expor e testar `GET /weather` com Supertest.
7. Criar tipos e serviço HTTP do frontend usando `VITE_API_BASE_URL`.
8. Implementar `useWeatherSearch`, componentes e `WeatherView` com testes de interação e acessibilidade; substituir o placeholder e remover o indicador de saúde.
9. Adicionar E2E críticos, validar 360/1280 px e executar a medição controlada de desempenho.
10. Executar lint, typecheck, builds, testes, cobertura e a rodada real de desempenho em QA.

### Dependências técnicas

- Backend: adicionar `vitest`, `@vitest/coverage-v8`, `supertest` e `@types/supertest` como dependências de desenvolvimento. O `fetch` nativo do Node será reutilizado; não será adicionado SDK ou cliente HTTP.
- Frontend: adicionar `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/user-event` e `@testing-library/jest-dom` como dependências de desenvolvimento.
- E2E: criar `e2e/package.json`, `e2e/package-lock.json`, configuração Playwright e dependência `@playwright/test`, sem criar `package.json` na raiz.
- Atualizar os lockfiles com npm e manter as três instalações independentes.
- Criar `backend/.env.example` com URLs públicas, timeout, CORS e porta; criar `frontend/.env.example` com `VITE_API_BASE_URL`.
- A disponibilidade da Open-Meteo é necessária somente para uso real e QA de desempenho; testes automatizados comuns não dependem dela.
- Não há migração, banco, credencial ou infraestrutura de persistência.

## Monitoramento e observabilidade

- Preservar `GET /health` como liveness local, sem transformar falha da Open-Meteo em falha do processo.
- Gerar um `requestId` por requisição e logs JSON pelos eventos `weather_query_completed`, `weather_provider_failed` e `unexpected_error`.
- Registrar nível `info` para resultado `success`, `not_found` ou `invalid`, com rota, status, duração total e durações das dependências.
- Registrar nível `error` para timeout, falha de rede, resposta externa inválida e erro inesperado, incluindo dependência e causa sanitizada.
- Não registrar o texto da cidade, corpo de resposta externa, IP ou outros dados desnecessários. A observabilidade não será usada como histórico de produto.
- Usar a duração fim a fim do navegador em QA para CA-09. Os logs de duração do backend ajudam a separar latência interna, geocodificação e previsão; não será introduzido um sistema de métricas neste MVP.
- Alertas e dashboards ficam fora do escopo até existir infraestrutura de coleta, mas os nomes e campos estáveis dos eventos permitirão agregação futura de taxa de erro, p95 e consumo estimado.

## Considerações técnicas

### Principais decisões

- **Endpoint GET com query:** representa leitura idempotente, é simples de inspecionar e mantém o nome da cidade como única entrada pública.
- **Primeiro resultado no backend:** aplica RF3 em um único lugar e impede que o frontend dependa do formato de geocodificação externo.
- **Contrato pronto para exibição:** o frontend recebe descrições, unidades, localização normalizada e atribuição, sem interpretar códigos WMO ou campos externos.
- **Validação nos dois lados:** o frontend fornece feedback imediato; o backend permanece a autoridade e nunca confia na query.
- **Um orçamento de 2,5 s:** reserva cerca de 500 ms para transporte e renderização dentro da meta de 3 s e impede que dois timeouts independentes somem além do SLO.
- **503 único para falha externa:** simplifica a recuperação no cliente sem esconder a causa dos logs. `404` permanece exclusivo para ausência de localidade.
- **Sem sucesso parcial:** os cinco dados meteorológicos são obrigatórios pelo PRD; payload incompleto não pode parecer uma consulta concluída.
- **Sem retry e cache no MVP:** reduz complexidade, latência de cauda e risco de dados antigos. Alternativas de retry exponencial e cache TTL foram descartadas nesta etapa.
- **`fetch` nativo e bibliotecas existentes:** evita SDK desnecessário; React, Express, Tailwind e utilitários atuais são suficientes.
- **Indicador de saúde removido do frontend:** decisão confirmada pelo usuário; `/health` permanece apenas para infraestrutura.
- **Desempenho determinístico + QA real:** decisão confirmada pelo usuário; CI mede a aplicação com dependências controladas e QA mede o provedor real.

### Riscos conhecidos

- Duas chamadas externas sequenciais tornam o p95 dependente da Open-Meteo. Mitigação: orçamento único, payload mínimo, sem retry e medição por etapa.
- O plano gratuito tem limites e uso não comercial. Mitigação: registrar falhas `429`, não fazer polling/retry e revalidar termos e volume antes de releases.
- O primeiro resultado pode não representar a intenção do usuário em nomes homônimos. Mitigação: exibir cidade, divisão administrativa e país; a seleção manual está fora do escopo.
- Campos externos podem ser omitidos ou mudar opcionalmente. Mitigação: validar `unknown`, normalizar apenas divisão administrativa para `null` e falhar de modo seguro nos dados obrigatórios.
- Códigos WMO novos podem surgir. Mitigação: mapeamento exaustivo testado e fallback como resposta externa inválida, nunca uma descrição enganosa.
- A duplicação da validação de cidade entre frontend e backend pode divergir. Mitigação: especificação única de normalização e casos equivalentes nas duas suítes.
- O projeto ainda não possui CI nem observabilidade agregada. Mitigação: scripts reproduzíveis, cobertura local e logs estruturados; automação de pipeline continua fora desta funcionalidade.
- A rodada real de CA-09 não é perfeitamente repetível. Mitigação: separar o teste controlado bloqueante da evidência real de QA e registrar condições da amostra.

### Conformidade com o AGENTS.md e as rules

Foram lidos integralmente `AGENTS.md` e todos os arquivos em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- Frontend e backend permanecem aplicativos independentes, com dependências e comandos executados em seus diretórios.
- O backend seguirá `routes → services → data`; o frontend seguirá `view → components/hooks → services → backend`.
- Arquivos `.ts` terão no máximo 100 linhas, funções no máximo 30 linhas, até três parâmetros, tipagem explícita, nenhum `any`, guard clauses e imports ES coerentes com cada aplicativo.
- Cada tipo compartilhado ficará em arquivo próprio; componentes React terão responsabilidade única e no máximo 30 linhas, exigindo as extrações listadas.
- URLs e timeouts variáveis serão configurados por ambiente com exemplos versionáveis, sem segredos.
- O servidor usará `async/await`, `fetch` não bloqueante, logging centralizado e graceful shutdown idempotente.
- Todo código novo terá testes automatizados; Vitest, Playwright, pirâmide, FIRST e cobertura mínima de 80% serão aplicados.
- Antes da conclusão da implementação, deverão passar: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` no frontend; `npm run build`, `npm test` e `npm run test:coverage` no backend; e a suíte do projeto `e2e/`.
- O build atual do backend, quebrado por parâmetros não usados, será corrigido pela extração e tipagem dos handlers, sem suprimir `noUnusedParameters`.
- Não serão adicionados comentários ao código salvo quando absolutamente necessários; a estrutura e os nomes devem expressar intenção.

### Conformidade com skills

- `criar-techspec` — aplicada integralmente: PRD analisado, projeto explorado com agente Explore antes das perguntas, premissas confirmadas, template preservado e especificação sem implementação.
- `react` — aplicável ao frontend. A arquitetura separa acesso HTTP, hook e apresentação; usa componentes pequenos e props explícitas, estado sem redundância, efeitos apenas para fronteiras externas/limpeza, sem memoização prematura, semântica HTML, regiões vivas, foco visível e Tailwind. Não há desvio planejado. O `Button` genérico existente não será necessário para o formulário e não será alterado como parte desta funcionalidade.

### Arquivos relevantes e dependentes

Existentes a modificar:

- `backend/src/index.ts`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/tsconfig.json`
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/index.html`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vite.config.ts`

Backend a criar:

- `backend/.env.example`
- `backend/vitest.config.ts`
- `backend/src/app.ts`
- `backend/src/config/environment.ts`
- `backend/src/routes/health-route.ts`
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
- testes `*.test.ts` próximos aos módulos correspondentes.

Frontend a criar:

- `frontend/.env.example`
- `frontend/vitest.config.ts`
- `frontend/src/test/setup.ts`
- `frontend/src/views/WeatherView.tsx`
- `frontend/src/components/WeatherSearchForm.tsx`
- `frontend/src/components/WeatherFeedback.tsx`
- `frontend/src/components/WeatherResult.tsx`
- `frontend/src/components/SourceAttribution.tsx`
- `frontend/src/hooks/useWeatherSearch.ts`
- `frontend/src/services/weather-service.ts`
- `frontend/src/types/weather-response.ts`
- `frontend/src/types/api-error.ts`
- `frontend/src/types/weather-search-state.ts`
- testes `*.test.ts` e `*.test.tsx` próximos aos módulos correspondentes.

E2E a criar:

- `e2e/package.json`
- `e2e/package-lock.json`
- `e2e/playwright.config.ts`
- `e2e/weather-panel.spec.ts`

