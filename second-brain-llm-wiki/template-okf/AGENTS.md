# LLM Wiki em Open Knowledge Format

Este diretório combina o padrão LLM Wiki descrito por Andrej Karpathy com a
especificação Open Knowledge Format (OKF) v0.2:

- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

## Ideia central

Mantenha uma wiki persistente em Markdown entre o usuário e suas fontes. Em vez
de reconstruir o conhecimento a partir dos documentos brutos a cada pergunta,
leia as fontes, extraia o que importa e integre esse conteúdo à wiki existente.

A wiki deve acumular valor: novas fontes e novas perguntas podem atualizar
páginas, conexões, comparações e sínteses já existentes.

O usuário seleciona fontes, explora o conteúdo e faz perguntas. O agente mantém
a wiki: resume, organiza, cria relações, atualiza páginas e cuida da
consistência.

## Arquitetura

### `raw/`

Coleção curada de documentos-fonte, como artigos, papers, imagens e arquivos de
dados.

- É a fonte de verdade.
- O agente pode ler seus arquivos, mas nunca deve modificá-los.
- Não faz parte do bundle OKF e, por isso, seus arquivos não precisam seguir o
  formato de documentos de conceito.

### `wiki/`

Bundle de conhecimento OKF v0.2 e diretório de arquivos Markdown gerados e
mantidos pelo agente. Pode conter resumos, páginas de entidades, páginas de
conceitos, comparações, panoramas e sínteses.

- O agente cria e atualiza as páginas.
- O agente mantém referências cruzadas e consistência entre elas.
- O usuário e qualquer consumidor compatível com OKF consultam o resultado.
- A raiz do bundle é `wiki/`; links iniciados por `/` são relativos a ela.

### `AGENTS.md`

Schema operacional usado pelo Codex. Define a estrutura, as convenções e os
fluxos seguidos pelo agente. Pode evoluir com o uso, em colaboração com o
usuário. Não faz parte do bundle OKF.

## Documentos de conceito OKF

Todo arquivo `.md` dentro de `wiki/`, exceto os nomes reservados `index.md` e
`log.md`, representa exatamente um conceito. O caminho sem a extensão `.md` é
o identificador estável desse conceito. Prefira nomes de arquivo descritivos em
`kebab-case` e não altere caminhos sem atualizar os links de entrada.

Cada documento de conceito deve ser UTF-8 e começar com frontmatter YAML:

```markdown
---
type: Concept
title: Nome legível do conceito
description: Resumo do conceito em uma frase.
resource: https://example.com/recurso-canonico
tags: [tema, contexto]
generated:
  by: human:usuario
  at: 2026-07-23T12:00:00-03:00
sources:
  - id: fonte-principal
    resource: https://example.com/fonte
    title: Fonte principal
---

# Visão geral

Conteúdo estruturado e conectado a [outro conceito](/conceitos/outro.md),
conforme a [fonte principal][^fonte-principal].

[^fonte-principal]: Fonte principal

```

Regras do frontmatter:

- `type` é obrigatório, deve ser uma string curta, não vazia e autoexplicativa.
- `title`, `description`, `resource` e `tags` são recomendados quando seus
  valores forem conhecidos.
- `generated` é recomendado para registrar como o conteúdo atual foi produzido
  e quando ocorreu sua última alteração significativa.
- `verified`, `status` e `stale_after` são opcionais e devem ser usados quando
  houver confirmação, necessidade de ciclo de vida ou política de atualização.
- `sources` é recomendado quando o conceito deriva de fontes identificáveis.
- `description` deve conter uma única frase útil para índices e busca.
- `resource` identifica o recurso canônico descrito pela página; omita-o em
  conceitos abstratos sem recurso correspondente.
- `tags` deve ser uma lista YAML de strings curtas.
- `generated.by` deve seguir a convenção de atores: `<producer>/<version>` para
  agentes e ferramentas, `human:<id>` para pessoas e `process:<id>` para
  processos automatizados.
- `generated.at` e `verified[].at` devem usar data e hora ISO 8601.
- `verified` é uma lista de eventos de verificação, cada um com `by` e `at`.
  Um único evento também pode ser escrito como um mapeamento sem lista.
- `status` aceita `draft`, `stable` ou `deprecated`; quando ausente, o
  conceito é considerado `stable`.
- `stale_after` é uma data absoluta no formato `YYYY-MM-DD`; o conceito fica
  obsoleto quando a data atual for igual ou posterior a ela.
- Campos adicionais são permitidos quando o domínio justificar. Preserve
  campos desconhecidos ao editar uma página.
- Não invente metadados ausentes apenas para preencher o frontmatter.

Não existe uma taxonomia universal de tipos. Use poucos valores consistentes e
autoexplicativos, como `Source Summary`, `Entity`, `Concept`, `Comparison`,
`Synthesis`, `Playbook`, `Attested Computation` ou tipos específicos do domínio.

### Proveniência e confiança

Quando um conceito for derivado de material externo ou de outro conceito, use
`sources` no frontmatter:

~~~yaml
sources:
  - id: fonte-principal
    resource: https://example.com/fonte
    title: Fonte principal
    author: human:autor
    usage_count: 42
    last_modified: 2026-07-23
usage_window:
  from: 2026-07-01
  to: 2026-07-31
~~~

Cada entrada de `sources` deve ter `resource`. `id`, `title`, `author`,
`usage_count` e `last_modified` são opcionais. `usage_window` é irmão de
`sources` e contextualiza os valores de `usage_count`; uma fonte pode
sobrescrevê-lo localmente.

Para atribuir uma afirmação específica a uma fonte, use uma nota de rodapé
com o mesmo identificador de `sources[].id`:

```markdown
O processamento ocorre diariamente.[^fonte-principal]

[^fonte-principal]: Fonte principal
```

Não use uma lista genérica `# Citations` como convenção primária. Ela pode ser
interpretada como legado de OKF v0.1, mas novos documentos devem preferir
`sources` e notas de rodapé por afirmação.

## Corpo, links e citações

- Use Markdown estrutural: títulos, listas, tabelas e blocos de código.
- Prefira links absolutos relativos ao bundle, como
  `[Conceito](/conceitos/conceito.md)`. Links relativos também são válidos.
- Explique a relação no texto ao redor do link; o link, sozinho, não tipa a
  relação.
- Links quebrados são tolerados pelo OKF, mas devem ser reportados no `LINT` e
  corrigidos quando não representarem conhecimento ainda pendente.
- Afirmações vindas de material externo devem apontar para uma entrada em
  `sources`; quando a atribuição for por afirmação, use uma nota de rodapé
  cujo rótulo corresponda a `sources[].id`.
- Ao citar um arquivo local de `raw/`, use um link Markdown relativo ao arquivo.
  Ao citar uma fonte web, prefira a URL canônica.
- `# Schema`, `# Examples` e `# Computation` têm significado convencional no
  OKF e devem ser usados quando forem adequados ao conceito.

## Computações atestadas

Quando um conceito precisar declarar uma forma sancionada de calcular um valor,
use `type: Attested Computation`. O frontmatter pode incluir `runtime`,
`parameters`, `computation`, `executor` e `attester`; o corpo deve usar a seção
`# Computation` para registrar a definição executável. O OKF descreve a
computação e como verificá-la, mas não executa o código nem define seu pacote ou
ambiente de execução.

Exemplo mínimo:

~~~yaml
---
type: Attested Computation
title: Receita anual
runtime: bigquery
parameters:
  - name: year
    type: integer
    required: true
executor:
  resource: /skills/run-query.md
  receipt: [job_id, executed_sql, result]
attester:
  resource: /attesters/sql-equality.py
generated:
  by: human:usuario
  at: 2026-08-03T12:00:00-03:00
---

# Computation

```sql
SELECT SUM(amount) AS revenue
FROM finance.recognized_revenue
WHERE fiscal_year = @year
```
~~~

## Operações

### INGEST

Ao processar uma nova fonte adicionada a `raw/`:

1. Leia a fonte sem modificá-la.
2. Discuta com o usuário os principais pontos extraídos.
3. Crie ou atualize os documentos de conceito afetados, incluindo um resumo da
   fonte quando ele tiver valor próprio.
4. Preencha o frontmatter OKF de todo documento criado e atualize
   `generated.at` apenas nas alterações significativas. Preserve `generated.by`
   quando a origem do conteúdo não mudar.
5. Adicione links entre os conceitos relacionados e citações às fontes.
6. Atualize `wiki/index.md` e os índices de subdiretórios afetados, se existirem.
7. Atualize outras páginas de entidades, conceitos e sínteses afetadas.
8. Registre a operação em `wiki/log.md`.

Uma fonte pode afetar muitas páginas. O fluxo pode processar uma fonte por vez
com acompanhamento do usuário ou várias fontes em lote, conforme a preferência
registrada neste schema.

### QUERY

Ao receber uma pergunta sobre a wiki:

1. Leia `wiki/index.md` para localizar as páginas relevantes.
2. Navegue pelos índices de subdiretórios e links antes de fazer uma busca mais
   ampla.
3. Pesquise e leia os documentos de conceito relevantes.
4. Sintetize uma resposta com citações.
5. Produza o formato adequado à pergunta, que pode ser uma página Markdown,
   tabela comparativa, apresentação, gráfico ou canvas.
6. Quando uma resposta, comparação, análise ou conexão tiver valor durável,
   incorpore-a à wiki como um documento de conceito OKF e atualize índice e log.

Consultas úteis também devem contribuir para o acúmulo de conhecimento, em vez
de permanecer apenas no histórico da conversa.

### LINT

Periodicamente, faça uma revisão de saúde e conformidade da wiki. Verifique:

- se todo documento de conceito tem frontmatter YAML parseável e `type` não
  vazio;
- se `index.md` e `log.md` são usados somente com seus significados reservados;
- se `generated.at` e `verified[].at` são ISO 8601 e os metadados conhecidos
  estão consistentes;
- se `generated`, `verified`, `status`, `stale_after` e `sources` seguem suas
  convenções quando presentes;
- se atores usam os prefixos `human:`, `process:` ou `<producer>/<version>`;
- se notas de rodapé de atribuição resolvem para um `sources[].id`;
- contradições entre páginas;
- afirmações antigas superadas por fontes mais recentes;
- páginas órfãs, sem links de entrada;
- links internos quebrados ou relações sem contexto;
- conceitos importantes mencionados, mas sem página própria;
- referências cruzadas e citações ausentes;
- entradas ausentes ou desatualizadas nos índices;
- lacunas que poderiam ser preenchidas por novas fontes ou pesquisa na web.

Reporte também perguntas que merecem investigação e fontes que seria útil
adicionar. Um link quebrado não torna o bundle inválido segundo o OKF, mas ainda
pode indicar um problema de manutenção.

## Índices e log

### `wiki/index.md`

Índice raiz do bundle e ponto de entrada para descoberta progressiva. É o único
`index.md` que pode ter frontmatter, exclusivamente para declarar
`okf_version: "0.2"`.

Organize as entradas por categorias que emergirem do conteúdo. Cada entrada
deve usar um link relativo e, quando disponível, a `description` do conceito:

```markdown
# Conceitos

- [Nome](conceitos/nome.md) - Resumo do conceito em uma frase.
```

Um `index.md` também pode existir em subdiretórios. Nesses casos, não use
frontmatter, liste conteúdos com links relativos e inclua os subdiretórios
relevantes. Atualize os índices a cada ingestão que afetar seu escopo.

### `wiki/log.md`

Histórico de mudanças do bundle, agrupado por data e com as datas mais recentes
primeiro. Entradas antigas são imutáveis; novas entradas devem ser inseridas no
grupo da data correspondente, sem reescrever o histórico.

Use datas ISO 8601 e um tipo de operação em destaque:

```markdown
# Log de atualizações

## 2026-07-23

- **Ingestão**: Adicionado [nome do conceito](/conceitos/nome.md).
- **Consulta**: Incorporada uma comparação durável à wiki.
- **Lint**: Corrigidos links e metadados inconsistentes.
```

Registre consultas apenas quando produzirem uma alteração durável ou uma
decisão relevante para a manutenção da wiki.

## Conformidade e evolução

O bundle está conforme com OKF v0.2 quando:

1. cada `.md` não reservado sob `wiki/` tem frontmatter YAML parseável;
2. cada frontmatter contém `type` não vazio;
3. cada `index.md` e `log.md` segue sua estrutura reservada.

Famílias opcionais ausentes, tipos desconhecidos, campos adicionais, links
quebrados e índices ausentes em subdiretórios não invalidam o bundle. Um
conceito sem `verified` é consumível, mas deve ser tratado como não verificado;
um consumidor não deve rejeitá-lo por isso. Não acrescente complexidade antes
que ela seja necessária: o OKF padroniza o intercâmbio, não prescreve taxonomia,
banco, motor de busca, SDK ou plataforma.

Se a especificação-alvo mudar, atualize primeiro `okf_version` no índice raiz e
depois este schema operacional. Em escala moderada, os índices podem ser
suficientes; se a wiki crescer, uma ferramenta de busca local pode ser
adicionada.
