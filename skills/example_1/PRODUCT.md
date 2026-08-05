# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas que precisam consultar rapidamente as condições climáticas atuais de uma cidade. A situação de uso inferida é uma consulta curta, em desktop ou celular, para decidir atividades e deslocamentos.

## Product Purpose

Uma aplicação de previsão do tempo que permite pesquisar uma cidade e visualizar as condições atuais, incluindo temperatura, sensação térmica, umidade e vento. O sucesso é tornar o estado do clima imediatamente compreensível.

## Positioning

A interface transforma os dados reais retornados para cada cidade em uma atmosfera visual condizente com a temperatura e a condição climática, sem esconder as informações essenciais.

## Operating Context

O fluxo confirmado é pesquisar o nome de uma cidade, aguardar a consulta e ler a condição atual. A aplicação usa uma API local de clima.

## Capabilities and Constraints

- Pesquisa por cidade via `http://localhost:3000/weather`.
- Exibe temperatura, sensação térmica, umidade, vento, condição, local e país.
- Permite alternar entre Celsius e Fahrenheit.
- Deve preservar estados de carregamento, erro e validação.

## Brand Commitments

Direção solicitada: futurista, chamativa e inovadora, com alto contraste e cores que reflitam a temperatura e as condições de cada cidade.

## Evidence on Hand

Os únicos dados climáticos confirmados são os retornados pela API e definidos em `frontend/src/types/weather.ts`. Não há imagens, marca ou alegações externas para incorporar.

## Product Principles

- A condição atual deve ser entendida em um relance.
- A atmosfera visual acompanha os dados, nunca os substitui.
- Alto contraste deve manter a interface legível em todas as condições.
- Consultar uma cidade deve continuar rápido e direto.
