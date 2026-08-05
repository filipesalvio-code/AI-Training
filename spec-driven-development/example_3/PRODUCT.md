# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Node.js and Express. Existing project stack confirmed by repository.

## Users

Qualquer pessoa que queira consultar rapidamente o clima atual de uma cidade, incluindo pessoas que usam teclado, leitores de tela ou ampliação. Inferido diretamente do PRD.

## Product Purpose

Permitir que o usuário informe uma cidade e veja, em uma única tela, a localidade resolvida e as condições meteorológicas atuais em português do Brasil e unidades métricas. Sucesso significa concluir consultas válidas com orientação clara em falhas e sem chamadas externas feitas pelo navegador.

## Positioning

O backend resolve a localidade e centraliza a integração com a Open-Meteo, enquanto o painel entrega um resultado pronto para leitura e atribuído à fonte.

## Operating Context

Ferramenta web sem conta, histórico, persistência ou seleção manual entre cidades homônimas. A primeira localidade retornada é usada e identificada no resultado.

## Capabilities and Constraints

Busca por cidade, estados idle/loading/success/error, validação nos dois lados, resultado atual com cinco medidas, atribuição Open-Meteo, responsividade a partir de 360 px e `/health` restrito à infraestrutura. Sem previsões futuras, geolocalização, offline, histórico ou chamadas diretas do navegador à Open-Meteo.

## Evidence on Hand

PRD e TechSpec em `tasks/prd-painel-de-clima/`. Não há logo, imagens, depoimentos ou outras alegações externas fornecidas; não fabricar esses materiais.

## Product Principles

- Consulta curta e direta.
- Resultado explícito e contextualizado.
- Falhas acionáveis e recuperáveis.
- Transparência sobre a fonte.
- Acessibilidade como parte do fluxo principal.

## Accessibility & Inclusion

O fluxo deve ser operável por teclado, compatível com tecnologias assistivas, anunciar mudanças assíncronas e manter foco, contraste e leitura em telas de 360 px ou maiores. Inferido e confirmado pelo PRD e TechSpec.
