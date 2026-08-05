# Documento de Requisitos do Produto (PRD)

## Visão geral

O painel de clima passará a sugerir localidades enquanto o usuário digita no campo de cidade. A funcionalidade ajudará qualquer pessoa a encontrar a localidade desejada com menos esforço e a diferenciar cidades de mesmo nome antes de consultar o clima.

As sugestões serão globais e apresentarão cidade, estado ou região e país. Ao escolher uma opção, o painel consultará o clima da localidade selecionada, evitando que uma cidade homônima incorreta seja usada automaticamente.

## Objetivos

- Apresentar sugestões para entradas com ao menos dois caracteres úteis.
- Exibir até cinco localidades relevantes, identificadas por cidade, estado ou região disponível e país.
- Exibir as sugestões em até 500 ms após a última digitação em pelo menos 95% das consultas, sob conexão normal e com o provedor disponível.
- Garantir que 100% das localidades escolhidas sejam usadas na consulta de clima pelas coordenadas da opção selecionada.
- Permitir que o fluxo principal seja concluído com mouse, toque ou somente teclado.
- Manter a interface legível e operável em telas a partir de 360 px de largura.

## Histórias de usuário

- US1: Como usuário, quero receber sugestões enquanto digito para encontrar uma localidade rapidamente.
- US2: Como usuário, quero ver cidade, estado ou região e país em cada sugestão para distinguir localidades de mesmo nome.
- US3: Como usuário, quero selecionar uma sugestão para consultar o clima da localidade correta.
- US4: Como usuário de teclado ou tecnologia assistiva, quero navegar, selecionar e compreender as sugestões sem depender de mouse ou de elementos exclusivamente visuais.
- US5: Como usuário, quero receber uma orientação clara quando não houver sugestões ou o serviço estiver indisponível para saber como prosseguir.

## Principais funcionalidades

### Busca de sugestões

O campo atual de cidade oferecerá sugestões globais conforme o texto informado pelo usuário.

- RF1: O sistema deve iniciar a busca de sugestões quando houver ao menos dois caracteres úteis no campo.
- RF2: O sistema não deve buscar nem exibir sugestões para entradas vazias, compostas apenas por espaços ou com menos de dois caracteres úteis.
- RF3: O sistema deve atualizar as sugestões quando o texto pesquisado mudar.
- RF4: O sistema deve exibir no máximo cinco sugestões por consulta.

### Identificação e seleção da localidade

Cada sugestão deverá fornecer contexto suficiente para diferenciar localidades semelhantes.

- RF5: Cada sugestão deve exibir o nome da cidade, o estado ou a região quando disponível e o país.
- RF6: O usuário deve poder selecionar uma sugestão com mouse, toque ou teclado.
- RF7: As teclas de seta devem permitir navegar pelas sugestões, Enter deve selecionar a opção destacada e Escape deve fechar a lista.
- RF8: Ao selecionar uma sugestão, o sistema deve fechar a lista e iniciar a consulta de clima usando a localidade exata selecionada.
- RF9: Quando houver cidades homônimas, o sistema deve permitir que o usuário escolha entre as opções apresentadas em vez de selecionar automaticamente o primeiro resultado.

### Estados e recuperação de falhas

A interface deverá comunicar o resultado da busca de sugestões sem interromper o uso do campo.

- RF10: O sistema deve indicar que as sugestões estão sendo carregadas.
- RF11: Quando não houver correspondências, o sistema deve informar que nenhuma localidade foi encontrada.
- RF12: Quando o serviço de localidades estiver indisponível, o sistema deve apresentar uma mensagem clara e permitir nova tentativa por meio da edição do campo.
- RF13: Respostas de uma pesquisa anterior não devem substituir sugestões de um texto digitado posteriormente.
- RF14: A lista deve ser fechada quando o campo for limpo, quando uma sugestão for escolhida, quando o usuário pressionar Escape ou quando o foco sair da interação de autocomplete.

## Critérios de aceitação

- CA-01 (US1, RF1–RF4): Dado que o campo contém ao menos dois caracteres úteis, quando o usuário parar de digitar, então o sistema deve apresentar até cinco sugestões correspondentes.
- CA-02 (US1, RF2): Dado um campo vazio, com apenas espaços ou com menos de dois caracteres úteis, quando o conteúdo mudar, então nenhuma busca de sugestões deve ser iniciada e nenhuma lista deve permanecer visível.
- CA-03 (US2, RF5): Dada uma sugestão recebida, quando ela for exibida, então deve identificar a cidade, o país e o estado ou região quando essa informação estiver disponível.
- CA-04 (US2, US3, RF8, RF9): Dadas duas ou mais localidades de mesmo nome, quando o usuário escolher uma delas, então a consulta de clima deve usar a localidade selecionada e o resultado deve identificá-la corretamente.
- CA-05 (US3, RF6): Dada uma sugestão visível, quando o usuário a selecionar com mouse ou toque, então a lista deve ser fechada e a consulta de clima da opção deve ser iniciada.
- CA-06 (US4, RF6, RF7): Dada uma lista de sugestões aberta, quando o usuário utilizar somente o teclado, então deve conseguir percorrer as opções, selecionar a destacada com Enter e fechar a lista com Escape.
- CA-07 (US5, RF10): Dada uma busca de sugestões em andamento, quando o usuário aguardar a resposta, então deve perceber um estado de carregamento sem perder o conteúdo digitado.
- CA-08 (US5, RF11): Dada uma pesquisa sem correspondências, quando a busca terminar, então o sistema deve informar que nenhuma localidade foi encontrada e manter o campo editável.
- CA-09 (US5, RF12): Dada uma falha do serviço de localidades, quando a busca terminar, então o sistema deve informar a indisponibilidade e permitir uma nova tentativa após a edição do campo.
- CA-10 (US1, RF3, RF13): Dado que o usuário alterou rapidamente o texto pesquisado, quando as respostas forem recebidas fora de ordem, então apenas as sugestões correspondentes ao texto atual devem ser exibidas.
- CA-11 (Objetivo de desempenho): Dado um conjunto representativo de pesquisas e o provedor disponível, quando o tempo entre a última digitação e a exibição for medido sob conexão normal, então pelo menos 95% das listas devem aparecer em até 500 ms.
- CA-12 (US4): Dado o uso de tecnologia assistiva, quando a lista abrir, carregar, receber opções, ficar sem resultados ou falhar, então o campo, o estado da lista, a opção destacada e as mensagens devem ser identificáveis sem depender somente de cor ou ícones.
- CA-13 (US4): Dadas larguras de tela de 360 px e 1280 px, quando a lista estiver aberta, então as sugestões devem permanecer legíveis, selecionáveis e sem causar rolagem horizontal.

## Experiência do usuário

O público é o mesmo do painel de clima: pessoas que desejam consultar rapidamente as condições atuais de uma localidade, inclusive usuários de teclado, leitores de tela, toque ou ampliação.

Ao digitar ao menos dois caracteres, o usuário perceberá o carregamento e verá até cinco sugestões abaixo do campo. Cada opção mostrará cidade, estado ou região disponível e país. O usuário poderá continuar digitando para refinar os resultados, percorrer as opções com as setas ou selecionar uma delas com mouse, toque ou Enter. A seleção fechará a lista e iniciará a consulta do clima.

A lista deverá se manter visualmente associada ao campo, destacar a opção ativa sem depender somente de cor, preservar foco visível e usar tamanho adequado para toque. Mudanças de carregamento, resultados, ausência de correspondências e erros deverão ser comunicadas a tecnologias assistivas. Em telas pequenas, os textos poderão quebrar linha sem esconder informações essenciais ou criar rolagem horizontal.

## Restrições técnicas de alto nível

- A funcionalidade deve respeitar a separação existente entre o frontend React e o backend Node.js/Express.
- O frontend deve obter sugestões exclusivamente pelo backend da aplicação, sem chamar diretamente serviços externos.
- A busca global de localidades deve usar a [Geocoding API da Open-Meteo](https://open-meteo.com/en/docs/geocoding-api), que oferece pesquisa por nome parcial e dados de cidade, áreas administrativas, país e coordenadas.
- A funcionalidade deve preservar a integração existente de consulta do clima pela Open-Meteo.
- A meta de desempenho é exibir sugestões em até 500 ms em pelo menos 95% das consultas, sob conexão normal e com o provedor disponível.
- O nome digitado e as localidades sugeridas ou selecionadas não devem ser persistidos como histórico de produto.
- O uso do provedor deve respeitar suas condições vigentes, sua atribuição e os limites aplicáveis ao plano adotado.
- A disponibilidade, a ordenação e a cobertura das sugestões dependem do provedor externo.

## Fora do escopo

- Geolocalização automática pelo navegador ou por endereço IP.
- Busca por endereço completo, rua ou ponto de interesse.
- Histórico de pesquisas, favoritos ou sugestões personalizadas.
- Criação, edição ou correção manual de localidades.
- Mapas ou visualização geográfica das sugestões.
- Funcionamento offline ou uso de um provedor alternativo quando a Open-Meteo estiver indisponível.
- Alterações nos dados meteorológicos exibidos após a seleção da localidade.
