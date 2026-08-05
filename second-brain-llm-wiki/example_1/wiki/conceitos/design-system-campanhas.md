---
type: Design System
title: Design system para campanhas
description: Regras visuais, componentes, acessibilidade e formatos para peças de mídia da NexoERP.
tags: [nexoerp, design-system, campanhas, mídia, acessibilidade]
generated:
  by: codex/1.0
  at: 2026-08-03T00:00:00-03:00
sources:
  - id: fonte-07
    resource: ../../raw/07-design-system-para-campanhas.md
    title: Design system para anúncios e campanhas
---

# Visão geral

O design system de campanhas organiza uma linguagem visual clara, conectada e
legível para peças de mídia da NexoERP. Os componentes internos do produto
possuem biblioteca própria.[^fonte-07]

## Cores

| Nome | Hex | Uso |
| --- | --- | --- |
| Nexo Navy | `#102A43` | Títulos, fundos escuros e textos de destaque. |
| Nexo Blue | `#1769E0` | Botões, links e elementos de ação. |
| Nexo Aqua | `#16A6A1` | Dados positivos, conexões e detalhes de apoio. |
| Cloud | `#F5F8FC` | Fundo claro. |
| Ink | `#17202A` | Texto principal em fundo claro. |
| Slate | `#5D6B7A` | Texto secundário. |
| White | `#FFFFFF` | Superfícies e texto sobre fundos escuros. |

Cores funcionais: sucesso `#18864B`, atenção `#B76A00`, erro `#C43838` e
informação `#1769E0`. Vermelho e verde não devem ser a única forma de
diferenciar dados; acrescentar rótulo, ícone ou padrão.

## Tipografia e layout

A fonte principal é **Inter**, com **Arial, sans-serif** como alternativa.
Usar peso 400 no corpo, 600 em subtítulos e 700 em títulos. Evitar 300 em
mídia. Em peças quadradas, títulos devem ocupar no máximo três linhas e o texto
essencial não pode depender da legenda da plataforma.

## Logo, formas e botões

Usar o arquivo oficial azul em fundo claro e o branco sobre Navy, mantendo área
livre equivalente à altura da letra `N`. Não inclinar, sombrear, alterar cores,
comprimir, contornar ou colocar o logo em uma forma que pareça parte dele. O
símbolo isolado é reservado a avatar, favicon e peças com a marca completa em
outro ponto.

Usar linhas conectadas, módulos retangulares com cantos de 12 px e gráficos
simples. Evitar excesso de círculos decorativos, degradês neon, efeitos 3D e
estética de criptomoeda.

O botão primário tem fundo Nexo Blue, texto branco e raio de 8 px. O secundário
tem fundo branco, borda e texto Nexo Blue. Rótulos curtos incluem `Ver
demonstração`, `Conhecer plataforma` e `Fazer diagnóstico`. Não desenhar botão
falso em peça não clicável, como PDF impresso.

## Fotografia e ilustração

Preferir luz natural, cenário brasileiro plausível e equipes de duas a seis
pessoas em situações concretas de colaboração. Interfaces devem usar dados
fictícios e legíveis; não usar captura de cliente real sem autorização.

Ilustrações devem ser geométricas, frontais ou levemente isométricas, com traços
consistentes. Azul é dominante e Aqua destaca conexão ou progresso.

## Acessibilidade e formatos

- contraste mínimo de 4,5:1 para texto normal;
- corpo equivalente a pelo menos 16 px em landing pages;
- legendas em todos os vídeos;
- texto alternativo para imagens informativas;
- nenhuma informação importante somente dentro da imagem;
- evitar animações rápidas ou piscantes.

| Peça | Formato |
| --- | --- |
| Feed quadrado | 1080 × 1080 px |
| Feed vertical | 1080 × 1350 px |
| Stories e reels | 1080 × 1920 px |
| Display horizontal | 1200 × 628 px |
| LinkedIn documento | 1080 × 1350 px por página |

Em stories e reels, manter textos e logo a pelo menos 80 px das bordas para
evitar cobertura pelos controles da plataforma.

[^fonte-07]: [Design system para anúncios e campanhas](../../raw/07-design-system-para-campanhas.md)
