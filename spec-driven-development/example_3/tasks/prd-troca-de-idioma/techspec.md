# Especificação técnica

## Resumo

A troca de idioma será resolvida no frontend, sem rede. O backend deixará de ser a origem do texto exibido e passará a expor os dados que permitem traduzir no cliente: `current.weatherCode` (código WMO) e `location.countryCode` (ISO-3166-1 alfa-2), mantendo `current.condition` em pt-BR como campo legado para não quebrar o contrato atual. O frontend ganhará uma camada de i18n própria e mínima — dicionários tipados por idioma, um contexto React com o idioma ativo, um hook `useTranslation` e formatadores baseados em `Intl` — de modo que a troca seja apenas uma mudança de estado que re-renderiza a árvore já montada.

Com isso, trocar o idioma não dispara requisição, não cancela consulta em andamento, preserva o texto digitado e o resultado exibido, e conclui dentro do limite de 300 ms do CA-11. O backend passará a aceitar `lang` opcional em `GET /weather`, usado apenas para pedir à Geocoding API os nomes já localizados na consulta inicial; valor ausente ou inválido mantém `pt`. As mensagens de erro deixarão de trafegar como texto exibível: o estado do frontend guardará apenas o `ApiErrorCode`, e a apresentação escolherá a mensagem no idioma ativo, o que atende CA-05 e CA-06 sem nova consulta. Nenhuma preferência será persistida — o idioma volta a pt-BR a cada carregamento, conforme RF18 e RF19.

## Arquitetura do sistema

### Visão dos componentes

Fluxo de tradução (sem rede) e fluxo de consulta (com rede) convivem sem se cruzar:

```text
LanguageProvider (estado: language)
  → useTranslation → t(key), language, toggleLanguage
    → LanguageToggle          (troca o idioma)
    → WeatherView             (aria-label, cabeçalho, rodapé)
      → WeatherSearchForm     (rótulo, placeholder, botão, validação)
      → WeatherFeedback       (carregamento e erro por código)
      → WeatherResult         (rótulos, condição por weatherCode, país por countryCode, números por Intl)
      → SourceAttribution     (atribuição e licença)
  → useDocumentLanguage       (document.documentElement.lang e document.title)

WeatherView → useWeatherSearch.search(city, language)
  → weatherService → GET /weather?city=...&lang=...
    → weatherRoute → GetCurrentWeather → OpenMeteoClient (geocoding language=pt|en)
```

Componentes novos no frontend:

- `src/i18n/language-context.ts` — cria o contexto do idioma sem exportar componente, evitando o aviso de `react-refresh/only-export-components`.
- `src/components/LanguageProvider.tsx` — mantém o idioma ativo em estado, monta o valor do contexto e sincroniza o documento.
- `src/components/LanguageToggle.tsx` — botão único de alternância, com nome acessível e texto visível traduzidos.
- `src/hooks/useTranslation.ts` — expõe `language`, `t` e `toggleLanguage`; falha explicitamente fora do provider.
- `src/hooks/useDocumentLanguage.ts` — único efeito da funcionalidade; sincroniza `lang` e `title` do documento.
- `src/i18n/pt-br.ts` e `src/i18n/en.ts` — dicionários completos, tipados por `Record<TranslationKey, string>`.
- `src/i18n/translations.ts` — agrega os dicionários por idioma e expõe a função de busca de chave.
- `src/i18n/weather-conditions-pt-br.ts` e `src/i18n/weather-conditions-en.ts` — rótulos dos códigos WMO.
- `src/i18n/weather-condition-label.ts` — resolve código + idioma, com degradação para o texto recebido do backend.
- `src/i18n/format-measurement.ts` — formata número por idioma com `Intl.NumberFormat` e concatena a unidade.
- `src/i18n/country-name.ts` — traduz o país com `Intl.DisplayNames`, com degradação para o nome recebido.
- `src/types/language.ts`, `src/types/translation-key.ts`, `src/types/translations.ts`, `src/types/language-context-value.ts` — um tipo por arquivo.

Componentes modificados no frontend:

- `src/App.tsx` — envolverá a view com `LanguageProvider`.
- `src/views/WeatherView.tsx` — consumirá `t`, exibirá `LanguageToggle` no cabeçalho e passará o idioma para a busca.
- `src/components/WeatherSearchForm.tsx` — receberá textos por props traduzidas pela view, mantendo props explícitas.
- `src/components/WeatherFeedback.tsx` — passará a receber `ApiErrorCode` e traduzir, em vez de exibir a mensagem do backend.
- `src/components/WeatherResult.tsx` — usará `weatherCode`, `countryCode` e os formatadores.
- `src/components/SourceAttribution.tsx` — comporá os dois segmentos de texto traduzidos ao redor dos links.
- `src/hooks/useWeatherSearch.ts` — `search(city, language)`; o estado de erro guardará apenas o código.
- `src/services/weather-service.ts` — enviará `lang`, validará `weatherCode` e `countryCode` e deixará de conter mensagens.
- `src/types/api-error.ts`, `src/types/weather-search-state.ts`, `src/types/weather-response.ts` — refletirão o contrato novo.

Componentes modificados no backend:

- `src/services/normalize-language.ts` — **novo**; converte o valor bruto de `lang` no idioma de geocodificação suportado.
- `src/routes/weather-route.ts` — lerá `lang`, normalizará e repassará ao caso de uso.
- `src/services/get-current-weather.ts` — `execute(city, language)`; incluirá `weatherCode` e `countryCode` na resposta.
- `src/data/open-meteo-client.ts` — `searchFirstLocation(city, language, signal)`; `language` deixa de ser fixo.
- `src/data/parse-geocoding-response.ts` — extrairá e validará `country_code`.
- `src/types/weather-provider.ts`, `src/types/resolved-location.ts`, `src/types/weather-location.ts`, `src/types/current-conditions.ts` — refletirão os campos novos.

Relações e limites:

- Nenhum módulo de i18n conhece HTTP; nenhum módulo de acesso ao backend conhece dicionários.
- `useWeatherSearch` não importa o contexto de idioma: recebe o idioma por parâmetro, permanecendo testável isoladamente.
- O backend não ganha dicionário em inglês; a única tabela de textos em inglês do projeto fica no frontend.
- `e2e/mock-open-meteo.mjs` passará a devolver `country_code` e a refletir o parâmetro `language` recebido.

## Design de implementação

### Principais interfaces

```text
useTranslation() -> { language, t, toggleLanguage }
  t(key: TranslationKey) -> string
  toggleLanguage() -> void

weatherConditionLabel(code, language, fallback) -> string
formatMeasurement(value, unit, language) -> string
countryName(countryCode, fallback, language) -> string
```

```text
WeatherProvider (backend)
  searchFirstLocation(city, language, signal) -> Promise<ResolvedLocation | null>
  getCurrentConditions(coordinates, signal) -> Promise<ProviderConditions>

GetCurrentWeather
  execute(city, language) -> Promise<WeatherResponse>

normalizeLanguage(value: unknown) -> 'pt' | 'en'

WeatherService (frontend)
  search(city, language, signal) -> Promise<WeatherResponse>
```

`toggleLanguage` usará atualização funcional de estado. O valor do contexto não será memoizado: `LanguageProvider` guarda apenas o idioma e só re-renderiza quando ele muda, situação em que todos os consumidores precisam re-renderizar de qualquer forma.

### Modelos de dados

Os contratos abaixo cobrem o que muda nesta funcionalidade. Contratos inalterados (`Coordinates`, `ProviderConditions`, `WeatherUnits`, `SourceAttribution`) permanecem como especificado na TechSpec do painel de clima. Campos ausentes na origem continuam normalizados para `null`.

#### `Language` — idioma ativo da interface

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| — | `'pt-BR' \| 'en'` | sim | União fechada; `pt-BR` é o padrão em todo carregamento. |

```text
"pt-BR"
```

#### `TranslationKey` e `Translations` — chaves e dicionários

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `TranslationKey` | união literal | sim | Lista fechada de chaves declarada em `types/translation-key.ts`. |
| `Translations` | `Record<TranslationKey, string>` | sim | Cada dicionário implementa o registro completo; chave faltante quebra a compilação. |

| Chave | pt-BR | en |
| --- | --- | --- |
| `header.eyebrow` | PAINEL METEOROLÓGICO | WEATHER PANEL |
| `header.title` | Clima de agora | Weather right now |
| `header.subtitle` | Consulte as condições atuais de qualquer cidade e veja a localidade resolvida em um instante. | Check current conditions for any city and see the resolved location in an instant. |
| `search.sectionLabel` | Consulta meteorológica | Weather search |
| `search.cityLabel` | Nome da cidade | City name |
| `search.cityPlaceholder` | Ex.: São Paulo | E.g. São Paulo |
| `search.submit` | Consultar clima | Check weather |
| `search.submitting` | Consultando… | Checking… |
| `feedback.loading` | Consultando as condições atuais… | Fetching current conditions… |
| `feedback.retryHint` | Confira o nome da cidade e tente novamente. | Check the city name and try again. |
| `error.INVALID_CITY` | Informe uma cidade com pelo menos dois caracteres. | Enter a city with at least two characters. |
| `error.CITY_NOT_FOUND` | Cidade não encontrada. Verifique o nome e tente novamente. | City not found. Check the name and try again. |
| `error.WEATHER_SERVICE_UNAVAILABLE` | Não foi possível consultar o clima agora. Tente novamente em instantes. | We could not check the weather right now. Try again shortly. |
| `error.INTERNAL_ERROR` | Ocorreu um erro inesperado. Tente novamente. | An unexpected error occurred. Try again. |
| `result.resolvedLocation` | Localidade resolvida | Resolved location |
| `result.apparentTemperature` | Sensação térmica | Feels like |
| `result.relativeHumidity` | Umidade relativa | Relative humidity |
| `result.windSpeed` | Velocidade do vento | Wind speed |
| `result.condition` | Condição atual | Current condition |
| `source.dataBy` | Dados por | Data by |
| `source.licensedUnder` | , licenciados sob | , licensed under |
| `footer.note` | Atualizado sob demanda · sem histórico de buscas | Updated on demand · no search history |
| `document.title` | Clima de agora | Weather right now |
| `language.toggleText` | PT → EN | EN → PT |
| `language.toggleLabel` | Idioma atual: português. Trocar para inglês. | Current language: English. Switch to Portuguese. |

> **Composição de frase com links:** `SourceAttribution` concatena `source.dataBy` + link da fonte + `source.licensedUnder` + link da licença + `.`, na mesma ordem nos dois idiomas. Um idioma futuro que exija outra ordem deverá substituir os dois segmentos por uma chave de frase completa com marcadores, e não reordenar o JSX.

#### `LanguageContextValue` — valor exposto pelo contexto

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `language` | `Language` | sim | Idioma ativo. |
| `t` | `(key: TranslationKey) => string` | sim | Busca a chave no dicionário do idioma ativo. |
| `toggleLanguage` | `() => void` | sim | Alterna entre os dois idiomas em uma chamada. |

```text
{
  "language": "pt-BR",
  "t": "(key) => string",
  "toggleLanguage": "() => void"
}
```

#### `ResolvedLocation` — localidade interna do backend (modificado)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `city` | `string` | sim | Nome da cidade, localizado pelo idioma da geocodificação. |
| `administrativeArea` | `string \| null` | sim | Primeira divisão disponível em `admin1` → `admin4`. |
| `country` | `string` | sim | País localizado pelo idioma da geocodificação. |
| `countryCode` | `string \| null` | sim | **Novo.** ISO-3166-1 alfa-2 em maiúsculas; `null` quando ausente ou fora do formato. |
| `coordinates` | `Coordinates` | sim | Coordenadas usadas na previsão. |

```text
{
  "city": "München",
  "administrativeArea": "Bayern",
  "country": "Alemanha",
  "countryCode": "DE",
  "coordinates": { "latitude": 48.1374, "longitude": 11.5755 }
}
```

#### `WeatherLocation` — localização pública (modificado)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `city` | `string` | sim | Cidade selecionada, como devolvida pelo provedor. |
| `administrativeArea` | `string \| null` | sim | Divisão administrativa disponível ou `null`. |
| `country` | `string` | sim | País no idioma pedido na consulta; usado como degradação. |
| `countryCode` | `string \| null` | sim | **Novo.** Base da tradução do país no cliente. |

```text
{
  "city": "München",
  "administrativeArea": "Bayern",
  "country": "Alemanha",
  "countryCode": "DE"
}
```

#### `CurrentConditions` — condições atuais (modificado)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `temperature` | `number` | sim | Temperatura em °C. |
| `apparentTemperature` | `number` | sim | Sensação térmica em °C. |
| `weatherCode` | `number` | sim | **Novo.** Código WMO inteiro conhecido; base da tradução no cliente. |
| `condition` | `string` | sim | **Legado.** Descrição sempre em pt-BR, mantida por compatibilidade; usada apenas como degradação. |
| `relativeHumidity` | `number` | sim | Umidade relativa entre 0 e 100. |
| `windSpeed` | `number` | sim | Velocidade do vento em km/h. |

```text
{
  "temperature": 24.3,
  "apparentTemperature": 25.1,
  "weatherCode": 2,
  "condition": "Parcialmente nublado",
  "relativeHumidity": 72,
  "windSpeed": 12.4
}
```

> **Campo legado:** `condition` não acompanha `lang`. Consumidores novos devem usar `weatherCode`. O frontend só recorre a `condition` se o código não existir no dicionário local, o que hoje é inalcançável porque o backend rejeita códigos desconhecidos com `WEATHER_SERVICE_UNAVAILABLE`.

#### `ApiError` — erro no frontend (modificado)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `code` | `ApiErrorCode` | sim | Único dado guardado no estado; a mensagem passa a ser derivada de `error.<code>`. |

```text
{
  "code": "CITY_NOT_FOUND"
}
```

> **Envelope HTTP inalterado:** o backend continua respondendo `{ "error": { "code", "message" } }` com `message` em pt-BR estável. O frontend lê apenas `code` e descarta `message`.

#### `WeatherResponse` — contrato agregado (modificado)

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `location` | `WeatherLocation` | sim | Inclui `countryCode`. |
| `current` | `CurrentConditions` | sim | Inclui `weatherCode`. |
| `units` | `WeatherUnits` | sim | Inalterado; métrico nos dois idiomas. |
| `source` | `SourceAttribution` | sim | Inalterado. |

```text
{
  "location": {
    "city": "München",
    "administrativeArea": "Bayern",
    "country": "Germany",
    "countryCode": "DE"
  },
  "current": {
    "temperature": 24.3,
    "apparentTemperature": 25.1,
    "weatherCode": 2,
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

#### Mapeamento `lang` → idioma da geocodificação

| Valor recebido em `lang` | Idioma enviado à Open-Meteo | Observação |
| --- | --- | --- |
| ausente | `pt` | Preserva o comportamento atual do contrato. |
| `pt-BR`, `pt-br`, `pt` | `pt` | Comparação sem diferenciar maiúsculas. |
| `en`, `en-US`, `en-GB` | `en` | Prefixo `en` é suficiente. |
| qualquer outro valor, array ou tipo inesperado | `pt` | Degrada para o padrão; **não** produz `400`. |

#### Mapeamento Geocoding API → contrato (complemento)

| Origem (Open-Meteo) | Destino (contrato) |
| --- | --- |
| `results[0].country_code` | `location.countryCode`, normalizado para maiúsculas quando corresponder a duas letras; caso contrário `null` |
| `language=<pt\|en>` | idioma de `results[0].name`, `country` e `admin*` |

#### Mapeamento código WMO → rótulo por idioma

| Código | pt-BR | en |
| --- | --- | --- |
| `0` | Céu limpo | Clear sky |
| `1` | Predominantemente limpo | Mainly clear |
| `2` | Parcialmente nublado | Partly cloudy |
| `3` | Encoberto | Overcast |
| `45` | Neblina | Fog |
| `48` | Neblina com geada | Depositing rime fog |
| `51` | Garoa leve | Light drizzle |
| `53` | Garoa moderada | Moderate drizzle |
| `55` | Garoa forte | Dense drizzle |
| `56` | Garoa congelante leve | Light freezing drizzle |
| `57` | Garoa congelante forte | Dense freezing drizzle |
| `61` | Chuva fraca | Slight rain |
| `63` | Chuva moderada | Moderate rain |
| `65` | Chuva forte | Heavy rain |
| `66` | Chuva congelante leve | Light freezing rain |
| `67` | Chuva congelante forte | Heavy freezing rain |
| `71` | Neve fraca | Slight snow fall |
| `73` | Neve moderada | Moderate snow fall |
| `75` | Neve forte | Heavy snow fall |
| `77` | Grãos de neve | Snow grains |
| `80` | Pancadas de chuva fracas | Slight rain showers |
| `81` | Pancadas de chuva moderadas | Moderate rain showers |
| `82` | Pancadas de chuva fortes | Violent rain showers |
| `85` | Pancadas de neve fracas | Slight snow showers |
| `86` | Pancadas de neve fortes | Heavy snow showers |
| `95` | Trovoada | Thunderstorm |
| `96` | Trovoada com granizo leve | Thunderstorm with slight hail |
| `99` | Trovoada com granizo forte | Thunderstorm with heavy hail |

A coluna pt-BR é idêntica à tabela já implementada em `backend/src/services/weather-condition.ts`, que permanece como está para alimentar o campo legado `condition`.

#### Formatação de número e de país no cliente

| Regra | pt-BR | en |
| --- | --- | --- |
| `Intl.NumberFormat`, `maximumFractionDigits: 1` | `24,3` | `24.3` |
| Concatenação com a unidade | `24,3°C`, `72%`, `12,4km/h` | `24.3°C`, `72%`, `12.4km/h` |
| `Intl.DisplayNames(type: 'region')` sobre `countryCode` | `DE` → Alemanha | `DE` → Germany |
| `countryCode` nulo, inválido ou `Intl` sem resultado | usa `location.country` recebido | usa `location.country` recebido |

> **Espaçamento preservado:** a concatenação valor+unidade permanece sem espaço, como já é exibido hoje. Esta funcionalidade muda apenas o separador decimal; alterar o espaçamento seria mudança visual não pedida pelo PRD.

Não há esquema de banco de dados nem qualquer persistência: o idioma vive apenas em estado de componente e é descartado no recarregamento.

### Endpoints da API (se aplicável)

#### Visão geral

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/weather` | Resolve a cidade e devolve condições atuais; aceita `lang` opcional. |
| `GET` | `/health` | Inalterado por esta funcionalidade. |

---

#### `GET /weather`

**Parâmetros de consulta**

| Parâmetro | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| `city` | `string` | — | Inalterado: obrigatório e único, `trim`, colapso de espaços, mínimo de dois caracteres Unicode alfanuméricos. |
| `lang` | `string` | `pt-BR` | **Novo.** Opcional. Normalizado conforme a tabela de mapeamento; valor inválido, repetido ou de tipo inesperado degrada para `pt` sem erro. |

**Respostas**

| Status | Corpo | Quando |
| --- | --- | --- |
| `200` | `WeatherResponse` | Localidade e condições validadas; inclui `weatherCode` e `countryCode`. |
| `400` | `ApiError` | Somente por `city` inválida; `lang` nunca produz `400`. |
| `404` | `ApiError` | Nenhuma localidade correspondente. |
| `503` | `ApiError` | Falha, timeout ou payload inválido de dependência externa. |
| `500` | `ApiError` | Falha inesperada interna. |

**Exemplo — sucesso em inglês**

```http
GET /weather?city=Munich&lang=en
```

O corpo é o exemplo de `WeatherResponse` documentado em “Modelos de dados”, com `location.country` igual a `Germany` por ter sido geocodificado com `language=en`. `Cache-Control: no-store` é mantido.

**Exemplo — sucesso sem `lang`**

```http
GET /weather?city=Munique
```

```text
{
  "location": {
    "city": "Munique",
    "administrativeArea": "Baviera",
    "country": "Alemanha",
    "countryCode": "DE"
  }
}
```

> Trecho parcial; os demais campos seguem o contrato completo.

**Exemplo — `lang` desconhecido**

```http
GET /weather?city=Munique&lang=xx
```

Responde `200` com geocodificação em `pt`, exatamente como a requisição sem `lang`.

**Exemplo — país sem código na origem**

```text
{
  "location": {
    "city": "Cidade Exemplo",
    "administrativeArea": null,
    "country": "País Exemplo",
    "countryCode": null
  }
}
```

> Com `countryCode` nulo, o frontend exibe `country` como recebido nos dois idiomas, conforme RF10.

---

## Pontos de integração

- **Geocoding API:** `https://geocoding-api.open-meteo.com/v1/search`. O parâmetro `language` deixa de ser fixo em `pt` e passa a receber `pt` ou `en`. A [documentação oficial](https://open-meteo.com/en/docs/geocoding-api) descreve `language` como “translated results, if available” e define `country_code` como ISO-3166-1 alfa-2, com `country` localizado quando possível. Ausência de tradução no provedor não é erro: o nome vem como estiver disponível.
- **Weather Forecast API:** inalterada. Nenhum parâmetro novo; `weather_code` já é solicitado e validado.
- **Autenticação, timeout, retry e cache:** inalterados. O orçamento único de 2.500 ms e a ausência de retry continuam valendo; a funcionalidade não acrescenta chamada externa nenhuma.
- **`Intl.NumberFormat` e `Intl.DisplayNames`:** APIs padrão do navegador, sem dependência nova. `Intl.DisplayNames` será chamado dentro de bloco protegido; qualquer exceção ou resultado indefinido degrada para o nome recebido do backend.
- **Licença:** a atribuição à Open-Meteo e a licença CC BY 4.0 continuam visíveis nos dois idiomas; apenas os conectores da frase são traduzidos, e nome da fonte, nome da licença e URLs permanecem inalterados.

## Abordagem de testes

Vitest no frontend e no backend, com os limiares de 80% já configurados em `vitest.config.ts` de cada aplicativo, e Playwright em `e2e/`. Os testes existentes que afirmam textos em pt-BR continuam válidos, pois pt-BR permanece o padrão; os que dependem do contrato de `/weather` serão atualizados para os campos novos. Nenhum teste determinístico acessa a Open-Meteo real.

### Testes de unidade

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-BE-10 | Normaliza `lang` conhecido, ausente e inválido | CA-10 | `pt-BR`, `pt`, ausente e valor desconhecido resultam em `pt`; `en` e `en-US` resultam em `en`; nenhum caso lança erro. |
| TU-BE-11 | Repassa o idioma normalizado à geocodificação | CA-10 | A URL de busca contém `language=en` quando o idioma é `en` e `language=pt` no caso padrão. |
| TU-BE-12 | Extrai e normaliza `country_code` | CA-10 | `de` vira `DE`; ausente, vazio ou fora do formato de duas letras vira `null` sem invalidar a consulta. |
| TU-BE-13 | Inclui `weatherCode` junto de `condition` no contrato | CA-04 | A resposta traz o código WMO íntegro e a descrição pt-BR legada. |
| TU-FE-10 | Garante paridade entre os dicionários | CA-02, CA-08 | Os dois idiomas têm exatamente as mesmas chaves, sem valor vazio. |
| TU-FE-11 | Traduz todos os códigos WMO nos dois idiomas | CA-04 | Cada um dos 28 códigos produz o rótulo especificado em pt-BR e em en. |
| TU-FE-12 | Degrada rótulo de código desconhecido | CA-04 | Código fora da tabela devolve o `condition` recebido, sem lançar erro. |
| TU-FE-13 | Formata número conforme o idioma | CA-09 | `24.3` é exibido como `24,3` em pt-BR e `24.3` em en, com unidade preservada. |
| TU-FE-14 | Traduz o país a partir do `countryCode` | CA-10 | `DE` produz `Alemanha` em pt-BR e `Germany` em en. |
| TU-FE-15 | Degrada país sem código ou sem tradução | CA-10 | Com `countryCode` nulo, exibe o `country` recebido nos dois idiomas. |
| TU-FE-16 | Alterna o idioma em uma chamada | CA-01 | `toggleLanguage` leva de `pt-BR` para `en` e de volta, sem estado intermediário. |
| TU-FE-17 | Falha ao usar a tradução fora do provider | — | `useTranslation` lança erro explícito, impedindo texto silenciosamente ausente. |
| TU-FE-18 | Sincroniza `lang` e `title` do documento | CA-12 | Após a troca, `document.documentElement.lang` é `en` e o título é o do idioma ativo. |
| TU-FE-19 | Expõe nome acessível e texto do alternador | CA-01, CA-14 | O botão tem nome acessível traduzido e texto visível indicando idioma atual e destino. |
| TU-FE-20 | Traduz o erro a partir do código | CA-05, CA-06 | O mesmo estado de erro renderiza a mensagem pt-BR ou en conforme o idioma ativo. |
| TU-FE-21 | Envia `lang` na consulta ao backend | CA-10 | O serviço monta `GET /weather?city=...&lang=en` quando o idioma ativo é `en`. |

O backend testa a normalização de idioma com valores `unknown`, incluindo array e número, e os parsers com `country_code` ausente, vazio, com três letras e em minúsculas. O frontend usa Testing Library com consultas por papel e nome acessível, sem depender de classes CSS; `Intl` não é mockado, pois é determinístico no ambiente de teste.

### Testes de integração

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-BE-10 | Responde 200 com `lang=en` e observa o provedor | CA-10, CA-17 | Supertest recebe o contrato com `weatherCode` e `countryCode`; o stub registra `language=en`. |
| TI-BE-11 | Ignora `lang` inválido sem quebrar o contrato | CA-10 | `lang=xx` e `lang` repetido respondem 200 com `language=pt`, nunca 400. |
| TI-BE-12 | Preserva os erros existentes com `lang` presente | CA-06, CA-17 | `INVALID_CITY`, `CITY_NOT_FOUND` e `WEATHER_SERVICE_UNAVAILABLE` mantêm código e status atuais. |
| TI-FE-10 | Traduz a tela inteira no estado inicial | CA-02, CA-08 | Após a troca, nenhum texto de produto em pt-BR permanece na árvore renderizada. |
| TI-FE-11 | Traduz o resultado sem nova requisição | CA-03, CA-04 | Com resultado na tela, a troca mantém os dados, traduz rótulos, condição e país, e `fetch` continua com uma única chamada. |
| TI-FE-12 | Preserva o texto digitado ao trocar | CA-07 | O valor do campo de cidade é idêntico antes e depois da troca. |
| TI-FE-13 | Traduz validação e erro sem perder o estado | CA-05, CA-06 | Mensagem de validação e de erro seguem visíveis e passam ao novo idioma, com nova tentativa possível. |
| TI-FE-14 | Não cancela consulta em andamento | CA-08 | Com resposta pendente, a troca mantém a requisição viva, traduz o carregamento e entrega o resultado ao final. |

Os testes de backend criam a aplicação com `WeatherProvider` stub e Supertest, sem `listen` e sem rede. Os testes de frontend substituem apenas `fetch` na fronteira do serviço e montam a árvore dentro de `LanguageProvider`.

### Testes E2E

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-10 | Encontra o alternador sem rolagem em 360 px | CA-01 | O botão está visível na primeira dobra e alterna o idioma em um clique. |
| E2E-11 | Traduz a tela inicial completa | CA-02 | Cabeçalho, formulário, rodapé e atribuição aparecem em inglês. |
| E2E-12 | Mantém e traduz o resultado exibido | CA-03, CA-04, CA-10 | Localidade, rótulos, condição e país passam a inglês sem refazer a busca. |
| E2E-13 | Não faz requisição ao trocar e responde em até 300 ms | CA-11 | Nenhuma requisição a `/weather` é registrada e o texto traduzido aparece dentro do limite. |
| E2E-14 | Preserva o texto digitado | CA-07 | O campo mantém o conteúdo após a troca. |
| E2E-15 | Traduz mensagens de validação e de erro | CA-05, CA-06 | As mensagens trocam de idioma e a nova tentativa conclui normalmente. |
| E2E-16 | Traduz durante consulta em andamento | CA-08 | Com resposta lenta, o carregamento aparece em inglês e o resultado é exibido sem cancelamento. |
| E2E-17 | Ajusta `lang` e título do documento | CA-12 | `html[lang]` e o título correspondem ao idioma ativo nas duas direções. |
| E2E-18 | Opera o alternador por teclado | CA-13 | O botão é alcançável por `Tab`, tem foco visível, é acionado por teclado e permanece focado após a troca. |
| E2E-19 | Volta ao padrão após recarregar | CA-15 | Depois de trocar para inglês e recarregar, a página está em pt-BR. |
| E2E-20 | Mantém layout em 360 px e 1280 px em inglês | CA-16 | Não há rolagem horizontal nem sobreposição com os textos em inglês. |
| E2E-21 | Consulta em inglês envia `lang` e não regride | CA-17 | A requisição inclui `lang=en`, o navegador não chama a Open-Meteo e o fluxo conclui normalmente. |

`e2e/mock-open-meteo.mjs` passará a devolver `country_code` e a refletir o `language` recebido no nome do país, permitindo verificar a passagem do parâmetro sem rede real. Os testes E2E existentes de 01 a 09 permanecem, com ajuste apenas onde o contrato ou o cabeçalho mudarem. `real-performance.spec.ts` continua fora da suíte determinística e não muda de escopo.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Backend: `normalize-language`, `country_code` no parser, `weatherCode` no contrato e repasse de `language` ao cliente, com os testes correspondentes. O contrato precisa existir antes do consumo no frontend.
2. Frontend, núcleo de i18n: tipos, dicionários, contexto, `LanguageProvider`, `useTranslation` e `useDocumentLanguage`, com testes. Nenhuma tela muda ainda.
3. Frontend, utilitários de apresentação: `weatherConditionLabel`, `formatMeasurement` e `countryName`, com testes de tabela completa e de degradação.
4. `LanguageToggle` e composição em `App` e `WeatherView`, garantindo nome acessível, foco preservado e posição no cabeçalho.
5. Migração dos componentes para `t(...)`, incluindo `aria-label` da seção e textos do formulário.
6. Erro por código: ajuste de `weather-service`, `useWeatherSearch`, tipos e `WeatherFeedback`, eliminando mensagens fixas do frontend.
7. Envio de `lang` na consulta e validação dos campos novos no serviço do frontend.
8. Atualização do mock da Open-Meteo, dos testes existentes afetados e inclusão dos E2E novos.
9. Validação final: `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` e `npm run test:coverage` no frontend; `npm run build`, `npm test` e `npm run test:coverage` no backend; suíte `e2e/`.

### Dependências técnicas

- Nenhuma dependência nova em nenhum dos três projetos; nenhum lock file muda por causa desta funcionalidade.
- Node do ambiente precisa ter ICU completo para `Intl.DisplayNames` de regiões, condição já satisfeita pelas versões suportadas pelo projeto e pelo navegador dos testes E2E.
- A ordem 1 → 7 é obrigatória apenas entre backend e o passo 7; os passos 2 a 5 podem avançar em paralelo ao backend porque não dependem do contrato novo.
- Não há migração, infraestrutura nova, credencial nem variável de ambiente adicional.

## Monitoramento e observabilidade

- Nenhum evento novo de log. O idioma é escolha de apresentação e não será registrado, evitando dado desnecessário sobre o usuário.
- `weather_query_completed` e `weather_provider_failed` permanecem com os mesmos campos. Se, no futuro, for necessário medir adoção do inglês, o idioma normalizado poderá ser incluído como campo de baixa cardinalidade, decisão fora desta especificação.
- `GET /health` continua sem relação com idioma e sem chamada externa.
- O limite de 300 ms do CA-11 é verificado por E2E-13, e não por métrica de produção: a troca não passa por rede.

## Considerações técnicas

### Principais decisões

- **Tradução no cliente, dados no contrato:** confirmada pelo usuário. Expor `weatherCode` e `countryCode` permite traduzir sem rede, o que é a única forma de atender simultaneamente CA-03, CA-08 e CA-11. A alternativa de traduzir no backend por `lang` exigiria refazer a consulta a cada troca, com duas chamadas externas e risco de falha em uma ação puramente visual.
- **`condition` mantido como legado:** preserva a compatibilidade exigida pelo PRD sem duplicar a tabela de 28 códigos em inglês no backend. O custo é um campo redundante, documentado como legado.
- **Cidade e região não retraduzidas após a troca:** confirmada pelo usuário. Só o país tem código estável para tradução local; retraduzir nomes próprios exigiria nova chamada de geocodificação. A degradação está explicitamente prevista em RF10.
- **`lang` opcional que nunca falha:** um idioma desconhecido é um detalhe de apresentação, não um erro de requisição. Degradar para `pt` mantém o contrato compatível com clientes que não conhecem o parâmetro.
- **i18n própria e mínima:** confirmada pelo usuário. Dois idiomas, cerca de 26 chaves, sem plural nem interpolação. Um `Record<TranslationKey, string>` transforma tradução faltante em erro de compilação, o que uma biblioteca genérica resolve em tempo de execução. `react-i18next` foi descartada por peso e configuração desproporcionais ao caso.
- **Erro guardado por código, não por mensagem:** hoje a mensagem entra no estado como texto; isso impediria retraduzir um erro já visível. Guardar apenas o código elimina a duplicação de mensagens entre serviço e hook e atende CA-05 e CA-06.
- **Idioma por parâmetro em `search`:** mantém `useWeatherSearch` independente da camada de i18n e testável sem provider, respeitando o fluxo `view → hooks → services`.
- **Sem persistência:** decisão de produto registrada no PRD. Elimina armazenamento local, sincronização entre abas e qualquer dado do usuário.
- **Sem região viva adicional para a troca:** o nome acessível do botão e o `lang` do documento mudam com o foco no próprio botão, o que já produz o anúncio. Uma segunda região viva competiria com a de carregamento e erro.
- **Formato numérico por `Intl`, espaçamento preservado:** atende RF12 sem alterar a identidade visual definida em `DESIGN.md`.

### Riscos conhecidos

- Textos em inglês e português têm comprimentos diferentes e podem quebrar o cabeçalho em 360 px. Mitigação: E2E-20 verifica as duas larguras no idioma novo, e o alternador usa rótulo curto de largura estável.
- `Intl.DisplayNames` pode não retornar nome para códigos raros ou ambientes com ICU reduzido. Mitigação: degradação explícita para o `country` recebido, coberta por TU-FE-15.
- Dicionários podem divergir ao longo do tempo. Mitigação: tipo `Record<TranslationKey, string>` e TU-FE-10 verificando paridade e valores não vazios.
- Textos duplicados entre a tabela desta especificação, os dicionários e os testes podem se desencontrar. Mitigação: os testes de tradução comparam contra o dicionário, e apenas TU-FE-11 fixa a tabela completa de códigos WMO.
- A alteração de `WeatherResponse` toca testes existentes de frontend, backend e E2E. Mitigação: campos apenas adicionados, `condition` mantido e sequenciamento que atualiza mock e testes em um passo próprio.
- Um resultado obtido antes da troca mantém cidade e região no idioma anterior, o que pode ser lido como tradução incompleta. Mitigação: comportamento previsto em RF10 e verificado por E2E-12, que valida país traduzido e nome próprio preservado.
- `condition` pode ser confundido com campo ativo por um consumidor futuro. Mitigação: marcação explícita como legado no contrato e nesta especificação.

### Conformidade com o AGENTS.md e as rules

Foram lidos integralmente `AGENTS.md` e todos os arquivos em `.agents/rules/`: `code-standards.md`, `folder-structure.md`, `javascript-typescript.md`, `node.md` e `tests.md`.

- Frontend e backend continuam independentes, com scripts executados em cada diretório e sem `package.json` na raiz.
- Backend segue `routes → services → data`: a rota lê `lang`, o serviço normaliza e orquestra, e a camada `data` monta a URL externa. Nenhuma importação nova aponta para trás.
- Frontend segue `view → components/hooks → services → backend`; os módulos de i18n não fazem acesso HTTP e o serviço HTTP não conhece dicionários, sem ciclo de importação.
- Limites respeitados: arquivos até 100 linhas, funções até 30 linhas, componentes React até 30 linhas, no máximo três parâmetros. Por isso os dicionários, os rótulos WMO e os formatadores ficam em arquivos separados por idioma e por responsabilidade.
- Tipagem explícita, sem `any`, com `unknown` refinado na validação de `lang` e da resposta HTTP; `const` por padrão, comparações estritas, arrow functions apenas em callbacks e nenhum ternário aninhado.
- Sem comentários no código; os nomes e a extração de funções expressam a intenção.
- Cada tipo compartilhado permanece em arquivo próprio dentro de `types/`.
- Node: nenhuma operação bloqueante nova, nenhuma variável de ambiente nova, logging centralizado inalterado, graceful shutdown inalterado, sem troca de gerenciador de pacotes e sem alteração de lock file.
- Testes: todo código novo terá teste; pirâmide preservada com base unitária, integração no contrato HTTP e E2E restrito aos fluxos críticos; FIRST respeitado, sem rede real nos testes determinísticos; cobertura mínima de 80% mantida pelos limiares já configurados.
- Desvio registrado: será criada a pasta `frontend/src/i18n/`, não prevista em `folder-structure.md`. Justificativa: dicionários e formatadores de idioma são responsabilidade clara e recorrente, não são acesso ao backend (`services/`), não são componentes, hooks ou tipos, e distribuí-los pelas pastas existentes violaria a coesão que a própria regra pede. A criação segue a convenção de criar pasta apenas quando há responsabilidade clara.

### Conformidade com skills

- `criar-techspec` — aplicada: PRD analisado, projeto e regras explorados antes das perguntas, quatro decisões confirmadas pelo usuário, template preservado e especificação sem implementação.
- `react` — aplicável e seguida: componentes pequenos com responsabilidade única e props explícitas, sem spread; hook customizado com prefixo `use`; `useEffect` apenas para sincronizar o documento, que é sistema externo; sem `useMemo` desnecessário; sem estado derivado redundante; atualização funcional em `toggleLanguage`; semântica de `button`, nome acessível, foco visível e responsividade com Tailwind. Sem desvio planejado; o `Button` genérico de `components/ui` continua não sendo usado por esta funcionalidade.
- As demais skills de `.agents/skills/` (`criar-prd`, `criar-tasks`, `executar-task`, `executar-review`, `executar-qa`, `impeccable`, `caveman`) não se aplicam a esta especificação.

### Arquivos relevantes e dependentes

Backend a modificar:

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

Backend a criar:

- `backend/src/services/normalize-language.ts`
- testes `*.test.ts` correspondentes aos módulos novos.

Frontend a criar:

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
- testes `*.test.ts` e `*.test.tsx` próximos aos módulos correspondentes.

Frontend a modificar:

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

E2E a modificar ou criar:

- `e2e/mock-open-meteo.mjs`
- `e2e/weather-panel.spec.ts`
- `e2e/language-switch.spec.ts`
