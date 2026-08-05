# Documento de Requisitos do Produto (PRD)

## Visão geral

O painel de clima apresenta hoje a temperatura e a sensação térmica exclusivamente em graus Celsius. Usuários acostumados à escala Fahrenheit precisam converter os valores mentalmente ou recorrer a outra ferramenta, o que interrompe uma consulta que deveria ser resolvida em uma única tela. Esta funcionalidade adiciona um alternador de unidade de temperatura ao resultado da consulta, permitindo ler os mesmos dados em °C ou °F sem refazer a busca.

A troca é uma preferência de exibição e acontece inteiramente no frontend: o backend continua entregando os dados em graus Celsius e o contrato HTTP permanece inalterado. A escolha vale enquanto a página estiver aberta, inclusive entre buscas diferentes, e volta ao padrão Celsius a cada novo carregamento. O escopo se limita à temperatura e à sensação térmica; umidade e vento seguem em porcentagem e quilômetros por hora.

## Objetivos

- Permitir a leitura da temperatura e da sensação térmica em °F com uma única interação, a partir de qualquer resultado já exibido.
- Atualizar os valores exibidos sem nenhuma requisição de rede adicional: 0 chamadas ao backend por troca de unidade.
- Refletir a unidade escolhida em 100% dos valores de temperatura visíveis no painel, incluindo o valor em destaque e a sensação térmica.
- Apresentar valores convertidos corretos em 100% dos casos, conforme a fórmula `°F = °C × 9/5 + 32`, com arredondamento ao inteiro mais próximo.
- Atualizar o painel em até 100 ms após a interação, sem exibir estado de carregamento e sem perder o resultado atual.
- Manter a unidade escolhida em 100% das consultas subsequentes realizadas na mesma sessão de página.
- Manter o alternador operável por teclado e com estado ativo perceptível por tecnologias assistivas, sem depender apenas de cor.

## Histórias de usuário

- US1: Como usuário acostumado à escala Fahrenheit, quero alternar a unidade da temperatura exibida para interpretar o resultado sem fazer conversões mentais.
- US2: Como usuário, quero que a sensação térmica acompanhe a unidade escolhida para não comparar dois valores em escalas diferentes.
- US3: Como usuário, quero identificar claramente qual unidade está ativa para não interpretar um valor na escala errada.
- US4: Como usuário, quero que a unidade escolhida continue valendo ao pesquisar outra cidade para não repetir a troca a cada consulta.
- US5: Como usuário de teclado ou tecnologia assistiva, quero alcançar, acionar e compreender o alternador e o efeito da troca sem depender de mouse ou de cor.
- US6: Como usuário, quero trocar a unidade sem perder o resultado exibido nem aguardar uma nova consulta.

## Principais funcionalidades

### Alternador de unidade de temperatura

Um controle de duas opções, `°C` e `°F`, fica junto ao resultado da consulta. Ele torna as duas unidades disponíveis simultaneamente à leitura e indica qual está ativa, evitando a ambiguidade de um interruptor que mostra apenas um estado. Como pertence ao bloco de resultado, só aparece quando existe um resultado para converter.

- RF1: O painel deve oferecer um controle com as opções `°C` e `°F` junto ao resultado da consulta.
- RF2: O controle deve indicar a unidade ativa por meio de rótulo e estado, sem depender exclusivamente de cor.
- RF3: O controle deve ficar visível apenas quando houver um resultado meteorológico exibido, permanecendo ausente nos estados inicial, de carregamento e de erro.
- RF4: A seleção da unidade já ativa não deve alterar o conteúdo exibido.

### Conversão e exibição dos valores

A conversão é aplicada na apresentação, sobre os dados em Celsius recebidos do backend.

- RF5: O painel deve converter a temperatura e a sensação térmica de °C para °F usando a fórmula `°F = °C × 9/5 + 32` quando a unidade ativa for Fahrenheit.
- RF6: O painel deve exibir os valores de temperatura arredondados ao inteiro mais próximo em ambas as unidades.
- RF7: O painel deve exibir o símbolo da unidade ativa (`°C` ou `°F`) junto de cada valor de temperatura.
- RF8: A umidade relativa e a velocidade do vento devem permanecer em porcentagem e quilômetros por hora, independentemente da unidade de temperatura escolhida.
- RF9: A troca de unidade não deve gerar nenhuma requisição ao backend nem alterar o contrato da API.

### Persistência da escolha na sessão de página

A preferência acompanha o uso contínuo do painel sem se tornar um dado armazenado do usuário.

- RF10: A unidade escolhida deve permanecer aplicada às consultas seguintes enquanto a página não for recarregada.
- RF11: A unidade padrão deve ser Celsius a cada carregamento da página.
- RF12: A escolha não deve ser gravada em armazenamento local, cookies, backend ou qualquer meio persistente.

### Acessibilidade do controle

O alternador integra o fluxo principal e precisa ser utilizável nas mesmas condições da busca.

- RF13: O controle deve ser alcançável e acionável somente pelo teclado, com indicador de foco visível.
- RF14: O controle deve expor um rótulo acessível que identifique sua finalidade e a unidade correspondente a cada opção.
- RF15: A unidade ativa deve ser exposta programaticamente às tecnologias assistivas.

## Critérios de aceitação

- CA-01 (US1, RF1, RF5, RF7): Dado um resultado exibido em Celsius, quando o usuário selecionar `°F`, então a temperatura deve ser apresentada convertida e acompanhada do símbolo `°F`.
- CA-02 (US2, RF5): Dado um resultado exibido em Fahrenheit, quando o painel for lido, então a sensação térmica deve estar na mesma unidade da temperatura em destaque.
- CA-03 (US1, RF5, RF6): Dada uma temperatura de 0 °C, 23 °C e -5 °C, quando a unidade ativa for Fahrenheit, então os valores exibidos devem ser 32 °F, 73 °F e 23 °F, respectivamente.
- CA-04 (US3, RF2, RF15): Dado o alternador visível, quando o usuário ou uma tecnologia assistiva inspecionar o controle, então a unidade ativa deve ser identificável por rótulo e estado, sem depender exclusivamente de cor.
- CA-05 (US6, RF9): Dada uma troca de unidade, quando as requisições de rede forem inspecionadas, então nenhuma nova requisição deve ser disparada e o resultado exibido deve ser mantido.
- CA-06 (US6, RF9): Dada uma troca de unidade, quando o painel for atualizado, então nenhum estado de carregamento deve ser apresentado.
- CA-07 (US4, RF10): Dada a unidade Fahrenheit selecionada, quando o usuário pesquisar outra cidade na mesma sessão de página, então o novo resultado deve ser exibido em Fahrenheit.
- CA-08 (US4, RF11): Dada a unidade Fahrenheit selecionada, quando a página for recarregada, então o painel deve voltar a exibir os valores em Celsius.
- CA-09 (RF8): Dada a unidade Fahrenheit ativa, quando o painel exibir umidade e vento, então esses valores devem permanecer em porcentagem e quilômetros por hora.
- CA-10 (RF3): Dados os estados inicial, de carregamento e de erro, quando o painel for exibido, então o alternador de unidade não deve estar presente.
- CA-11 (US5, RF13, RF14): Dado o uso exclusivo do teclado, quando o usuário navegar pelo painel, então deve alcançar o alternador em ordem de foco lógica, ver o indicador de foco e trocar a unidade sem usar o mouse.
- CA-12 (RF4): Dada a unidade Celsius ativa, quando o usuário selecionar novamente `°C`, então os valores exibidos devem permanecer inalterados.
- CA-13 (Objetivo de responsividade): Dadas larguras de tela de 360 px e 1280 px, quando o alternador for exibido junto ao resultado, então ele deve permanecer legível e operável, sem rolagem horizontal causada pela funcionalidade.

## Experiência do usuário

O público é o mesmo do painel de clima: qualquer pessoa que consulte rapidamente o clima de uma cidade, incluindo quem usa teclado, leitores de tela ou ampliação. A necessidade atendida é pontual e frequente entre usuários habituados a Fahrenheit ou que compartilham a informação com alguém que usa essa escala.

O fluxo permanece o mesmo: o usuário busca uma cidade e recebe o resultado em Celsius. Junto ao bloco de resultado, próximo à temperatura em destaque, aparece um alternador com as duas unidades. Ao acionar `°F`, a temperatura e a sensação térmica são recalculadas imediatamente, mantendo localidade, condição, umidade, vento e atribuição da fonte no lugar. Não há etapa intermediária, confirmação ou espera. Ao acionar `°C`, o painel retorna à leitura original.

O alternador comunica seu estado por texto e por estado programático, não apenas por cor ou preenchimento. Ele participa da ordem de foco do resultado, exibe indicador de foco visível e mantém contraste de texto em nível AA. Em telas a partir de 360 px, o controle acompanha o fluxo vertical do resultado sem provocar rolagem horizontal.

Em consultas seguintes na mesma sessão de página, a unidade escolhida continua ativa, evitando repetir a troca a cada busca. Ao recarregar a página, o painel volta ao padrão Celsius, coerente com o idioma e o contexto regional principal do produto.

## Restrições técnicas de alto nível

- A conversão deve ocorrer exclusivamente no frontend. O backend continua devolvendo temperatura e sensação térmica em graus Celsius e o contrato HTTP existente não deve ser alterado.
- A funcionalidade não deve introduzir novas integrações externas, dependências de rede ou chamadas adicionais ao backend.
- A preferência de unidade não deve ser persistida em `localStorage`, `sessionStorage`, cookies, backend ou qualquer outro meio, mantendo a restrição do produto de não armazenar dados do usuário.
- A funcionalidade deve respeitar a separação existente entre o frontend React e o backend Node.js/Express e a arquitetura de camadas já adotada no frontend.
- A exibição convertida deve preservar a atribuição exigida à Open-Meteo e a licença CC BY 4.0 já presentes no painel.
- A alteração deve manter a cobertura mínima de testes automatizados de 80% definida para o projeto, cobrindo a conversão, a troca de unidade e a preservação da escolha entre buscas.
- Este PRD revisa parcialmente a exclusão de "troca entre unidades métricas e imperiais" registrada no PRD do painel de clima: a revisão vale apenas para a temperatura, e as demais medidas permanecem métricas.

## Fora do escopo

- Conversão da velocidade do vento para milhas por hora, nós ou qualquer outra unidade imperial.
- Conversão de outras grandezas, como pressão, precipitação ou visibilidade, e suporte à escala Kelvin.
- Persistência da preferência entre sessões, por conta de usuário, por dispositivo ou por sincronização.
- Detecção automática da unidade pelo idioma do navegador, pela localidade consultada ou pela geolocalização.
- Alteração do contrato do backend, envio da unidade desejada na requisição ou conversão no servidor.
- Alternador de unidade global fora do bloco de resultado ou disponível antes da primeira consulta.
- Exibição simultânea das duas unidades no mesmo valor, como `23 °C (73 °F)`.
- Suporte a outros idiomas, formatos numéricos regionais ou alteração das casas decimais exibidas.
