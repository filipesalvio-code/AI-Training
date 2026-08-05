# Documento de Requisitos do Produto (PRD)

## Visão geral

O painel de clima é apresentado hoje exclusivamente em português do Brasil, o que impede seu uso confortável por pessoas que não leem esse idioma. Esta funcionalidade adicionará a troca de idioma entre português do Brasil (pt-BR) e inglês (en) por meio de um botão alternador de fácil acesso, visível no cabeçalho do painel. Ao acionar o botão, todo o conteúdo exibido passa imediatamente para o outro idioma, sem recarregar a página e sem que o usuário precise repetir a consulta em andamento ou já concluída.

O alcance da tradução é a experiência inteira: títulos, rótulos, textos de apoio, placeholder, botões, mensagens de carregamento, validação e erro, rótulos das medidas, atribuição da fonte e também as descrições de condição meteorológica hoje entregues pelo backend em português. As unidades permanecem métricas nos dois idiomas (°C, % e km/h); apenas a formatação numérica acompanha a convenção do idioma ativo. A escolha vale enquanto a página estiver aberta e o idioma padrão volta a ser pt-BR a cada novo carregamento.

## Objetivos

- Permitir a troca entre pt-BR e en em um único acionamento, a partir de qualquer estado do painel (inicial, carregando, sucesso ou erro).
- Traduzir 100% do conteúdo textual visível do painel nos quatro estados, sem que reste qualquer texto no idioma anterior após a troca.
- Refletir a troca em até 300 ms a partir do acionamento, sem recarregar a página e sem exigir que o usuário refaça a consulta.
- Preservar, em 100% das trocas, o conteúdo digitado no campo de cidade e o resultado meteorológico já exibido.
- Manter o idioma declarado do documento coerente com o idioma ativo em 100% das trocas, para leitores de tela e pronúncia correta.
- Manter o controle de idioma operável por teclado e identificável por tecnologia assistiva, com o idioma ativo comunicado sem depender apenas de cor, em telas a partir de 360 px de largura.
- Não degradar as metas do painel existente: consultas válidas continuam concluídas em até 3 segundos em pelo menos 95% dos casos.

## Histórias de usuário

- US1: Como usuário que lê inglês, quero trocar o idioma do painel com um clique para compreender a interface sem depender de tradução externa.
- US2: Como usuário, quero encontrar o controle de idioma imediatamente ao abrir o painel para não precisar procurar em menus ou rolar a página.
- US3: Como usuário que já consultou uma cidade, quero trocar o idioma e continuar vendo o mesmo resultado traduzido para não precisar refazer a busca.
- US4: Como usuário que lê inglês, quero que a descrição da condição meteorológica apareça em inglês para entender o clima sem interpretar termos em português.
- US5: Como usuário que recebeu uma mensagem de validação ou de erro, quero lê-la no idioma escolhido para saber como prosseguir.
- US6: Como usuário de teclado ou leitor de tela, quero alcançar, acionar e compreender o controle de idioma e perceber a mudança de conteúdo sem depender de mouse ou de indicação apenas visual.
- US7: Como usuário que trocou para inglês, quero ver os números no formato do idioma para ler valores sem ambiguidade entre vírgula e ponto decimal.

## Principais funcionalidades

### Controle de troca de idioma

Um botão alternador ficará no cabeçalho do painel, acima da área de busca, visível sem rolagem em todas as larguras suportadas. Ele indica o idioma ativo e alterna para o outro idioma a cada acionamento.

- RF1: O sistema deve exibir um controle de idioma no cabeçalho do painel, visível sem rolagem em telas a partir de 360 px de largura.
- RF2: O controle deve alternar entre pt-BR e en em um único acionamento, sem etapas intermediárias.
- RF3: O controle deve comunicar qual é o idioma ativo e qual será o idioma resultante do acionamento, por texto e não apenas por cor ou ícone.
- RF4: O controle deve permanecer disponível e acionável nos estados inicial, de carregamento, de sucesso e de erro.

### Tradução do conteúdo do painel

Todo o texto produzido pelo produto passa a existir nos dois idiomas, incluindo elementos de apoio à acessibilidade que não são visíveis na tela.

- RF5: O sistema deve apresentar no idioma ativo o título do painel, os textos introdutórios, o rótulo e o placeholder do campo de cidade, o texto do botão de busca em repouso e durante o carregamento, os rótulos das medidas, o texto da localidade resolvida, o rodapé e a atribuição da fonte.
- RF6: O sistema deve apresentar no idioma ativo as mensagens de carregamento, de validação de entrada e de erro, incluindo a orientação de nova tentativa.
- RF7: O sistema deve apresentar no idioma ativo os rótulos acessíveis não visíveis, como nomes de regiões e descrições associadas a controles.
- RF8: O sistema não deve exibir, após a troca, nenhum texto de produto no idioma anterior.

### Tradução do conteúdo meteorológico

A descrição da condição atual é hoje entregue em português pelo backend e precisa acompanhar o idioma ativo, porque é uma das informações mais lidas do resultado.

- RF9: O sistema deve exibir a descrição da condição meteorológica atual no idioma ativo, cobrindo todas as condições já suportadas pelo painel.
- RF10: O sistema deve apresentar a localidade resolvida — cidade, divisão administrativa disponível e país — no idioma ativo quando o provedor de dados oferecer essa denominação; quando não oferecer, deve exibir a denominação recebida sem alteração.
- RF11: A troca de idioma não deve alterar as unidades exibidas, que permanecem em graus Celsius, porcentagem e quilômetros por hora nos dois idiomas.
- RF12: O sistema deve formatar os valores numéricos segundo a convenção do idioma ativo, usando vírgula como separador decimal em pt-BR e ponto em en.

### Continuidade do estado durante a troca

Trocar o idioma é uma mudança de apresentação e não pode custar ao usuário o trabalho já realizado.

- RF13: A troca de idioma deve preservar o texto digitado no campo de cidade.
- RF14: A troca de idioma deve preservar o resultado meteorológico exibido, reapresentando-o traduzido, sem exigir nova busca do usuário.
- RF15: A troca de idioma durante uma consulta em andamento não deve cancelar essa consulta, e o resultado ou o erro correspondente deve ser apresentado no idioma ativo no momento da exibição.
- RF16: A troca de idioma deve preservar uma mensagem de validação ou de erro visível, reapresentando-a traduzida.
- RF17: A troca de idioma não deve recarregar a página nem levar o usuário para outro endereço.

### Idioma padrão e duração da escolha

A preferência vale para a sessão de leitura atual e não é armazenada.

- RF18: O sistema deve iniciar em pt-BR em todo carregamento da página, independentemente do idioma configurado no navegador.
- RF19: O sistema não deve persistir a escolha de idioma entre carregamentos, e um novo carregamento deve retornar ao idioma padrão.

### Idioma declarado do documento

A declaração de idioma sustenta a leitura correta por tecnologias assistivas e não pode ficar defasada em relação ao que está na tela.

- RF20: O sistema deve declarar o idioma da página conforme o idioma ativo e atualizar essa declaração a cada troca.
- RF21: O sistema deve apresentar o título da página no idioma ativo.

## Critérios de aceitação

- CA-01 (US1, US2, RF1–RF3): Dado o painel recém-carregado em qualquer largura a partir de 360 px, quando o usuário observar o cabeçalho sem rolar a página, então deve encontrar o controle de idioma indicando o idioma ativo e, ao acioná-lo uma única vez, o painel deve passar para o outro idioma.
- CA-02 (US1, RF5, RF8): Dado o painel em pt-BR no estado inicial, quando o usuário trocar para en, então título, textos introdutórios, rótulo e placeholder do campo, texto do botão, rodapé e atribuição devem estar em inglês, sem nenhum texto de produto remanescente em português.
- CA-03 (US3, US4, RF9, RF14): Dada uma consulta concluída com sucesso exibindo o resultado, quando o usuário trocar de idioma, então o mesmo resultado deve permanecer visível, com rótulos das medidas, texto da localidade resolvida e descrição da condição meteorológica no novo idioma, sem que o usuário refaça a busca.
- CA-04 (US4, RF9): Dada qualquer condição meteorológica suportada pelo painel, quando o resultado for exibido em en, então a descrição correspondente deve estar em inglês, e nenhuma condição suportada deve aparecer em português.
- CA-05 (US5, RF6, RF16): Dada uma mensagem de validação por cidade inválida visível na tela, quando o usuário trocar de idioma, então a mensagem deve continuar visível e ser exibida no novo idioma.
- CA-06 (US5, RF6, RF16): Dado um erro de cidade não encontrada ou de indisponibilidade do serviço visível na tela, quando o usuário trocar de idioma, então a mensagem de erro e a orientação de nova tentativa devem ser exibidas no novo idioma, e a nova tentativa deve permanecer possível.
- CA-07 (US3, RF13): Dado um texto digitado no campo de cidade e ainda não enviado, quando o usuário trocar de idioma, então o texto digitado deve permanecer inalterado no campo.
- CA-08 (RF15): Dada uma consulta em andamento, quando o usuário trocar de idioma antes da resposta, então a consulta não deve ser cancelada, a mensagem de carregamento deve aparecer no novo idioma e o resultado ou o erro deve ser apresentado no idioma ativo quando exibido.
- CA-09 (US7, RF11, RF12): Dado um resultado com valores decimais, quando o painel estiver em pt-BR e depois em en, então as unidades devem permanecer °C, % e km/h nos dois idiomas e o separador decimal deve ser vírgula em pt-BR e ponto em en.
- CA-10 (RF10): Dada uma localidade resolvida cujo país e divisão administrativa possuam denominação no idioma ativo fornecida pelo provedor, quando o resultado for exibido, então essa denominação deve ser apresentada no idioma ativo; quando não houver denominação correspondente, então a denominação recebida deve ser exibida sem alteração e sem erro.
- CA-11 (RF17, objetivo de resposta): Dada uma troca de idioma, quando o usuário acionar o controle, então o conteúdo deve ser atualizado em até 300 ms, sem recarregar a página e sem alterar o endereço exibido no navegador.
- CA-12 (US6, RF20, RF21): Dada a troca para en, quando o idioma declarado do documento e o título da página forem verificados, então ambos devem corresponder ao idioma ativo, e o mesmo deve valer ao retornar para pt-BR.
- CA-13 (US6, RF3, RF4): Dado o uso exclusivo do teclado, quando o usuário navegar pelo painel, então o controle de idioma deve ser alcançável em ordem de foco lógica, apresentar indicador de foco visível, ser acionável pelo teclado e manter o foco em um elemento previsível após a troca.
- CA-14 (US6, RF3, RF7): Dado o uso de tecnologia assistiva, quando o usuário encontrar o controle de idioma e acioná-lo, então o nome do controle, o idioma ativo e a mudança de idioma devem ser identificáveis sem depender exclusivamente de cor ou ícone, e os rótulos acessíveis não visíveis devem estar no idioma ativo.
- CA-15 (RF18, RF19): Dada uma troca para en seguida de recarregamento da página, quando o painel for exibido novamente, então ele deve estar em pt-BR, mesmo que o navegador esteja configurado em inglês.
- CA-16 (RF1, larguras suportadas): Dadas larguras de tela de 360 px e 1280 px, quando o painel for exibido em qualquer um dos idiomas, então o conteúdo traduzido deve permanecer legível e operável, sem rolagem horizontal e sem sobreposição de elementos causadas por textos mais longos.
- CA-17 (objetivo de não regressão): Dado o fluxo de busca existente, quando as consultas válidas forem executadas em qualquer um dos idiomas, então elas devem continuar concluídas em até 3 segundos em pelo menos 95% dos casos, e o navegador deve continuar consultando apenas o backend da aplicação.

## Experiência do usuário

O público principal continua sendo qualquer pessoa que queira consultar rapidamente o clima atual de uma cidade, agora incluindo explicitamente quem lê inglês e não lê português. Pessoas que usam teclado, leitores de tela ou ampliação fazem parte desse público e devem completar o mesmo fluxo, inclusive a troca de idioma.

Ao abrir o painel, o usuário vê o cabeçalho com o identificador da área, o título e, no mesmo bloco, o controle de idioma. O controle é uma única ação que mostra o idioma ativo e alterna para o outro. Um acionamento basta: o conteúdo da tela é reescrito no novo idioma, o campo de cidade mantém o que foi digitado e o resultado, se houver, permanece no lugar já traduzido. Nada é perdido e nenhuma busca precisa ser refeita.

A troca funciona em qualquer estado. Durante o carregamento, a mensagem de espera aparece traduzida e a consulta segue em andamento. Em erro ou validação, a mensagem e a orientação de nova tentativa são reapresentadas no idioma escolhido, preservando a possibilidade de corrigir a cidade e tentar de novo. No resultado, tanto os rótulos das medidas quanto a descrição da condição e a atribuição da fonte acompanham o idioma.

A experiência mantém as exigências já estabelecidas para o painel: responsividade a partir de 360 px, contraste de texto e controles em nível AA, foco visível, ordem de navegação lógica, rótulos programáticos associados aos controles e anúncio de mudanças assíncronas. Textos em inglês e em português têm comprimentos diferentes, e o layout deve absorver essa variação sem quebrar alinhamentos, truncar rótulos ou provocar rolagem horizontal. O idioma declarado do documento acompanha o idioma ativo para que a leitura sintetizada use a pronúncia correta.

## Restrições técnicas de alto nível

- A funcionalidade deve preservar a separação existente entre o frontend React e o backend Node.js/Express, e o frontend deve continuar consultando exclusivamente o backend da aplicação.
- O contrato HTTP existente da consulta de clima deve permanecer compatível para os consumidores atuais; a evolução necessária para entregar a condição meteorológica no idioma ativo não pode quebrar o comportamento já acordado.
- Os códigos de erro do backend devem permanecer estáveis e independentes de idioma; o texto exibido ao usuário é responsabilidade da camada de apresentação.
- Os idiomas suportados são pt-BR e en. Não é permitido introduzir serviço externo de tradução automática; os conteúdos traduzidos são mantidos pelo próprio produto.
- A denominação de localidades depende do que o provedor de dados oferece por idioma. Quando a denominação no idioma ativo não estiver disponível, a exibição deve degradar para o valor recebido, sem erro.
- A atribuição à Open-Meteo e a licença CC BY 4.0 devem permanecer visíveis e íntegras nos dois idiomas, conforme já exigido pelo painel.
- A preferência de idioma não pode ser persistida em armazenamento local, cookie ou servidor, e nenhum dado pessoal adicional pode ser coletado por causa desta funcionalidade.
- A troca deve ser refletida em até 300 ms sem recarregar a página, e a funcionalidade não pode comprometer a meta de 3 segundos para pelo menos 95% das consultas válidas.
- A acessibilidade deve atender ao nível AA da WCAG 2.1 nos aspectos aplicáveis, incluindo a declaração de idioma da página, foco visível e identificação programática do controle.
- As unidades permanecem métricas nos dois idiomas; nenhuma conversão de unidade pode ser introduzida por esta funcionalidade.

## Fora do escopo

- Suporte a um terceiro idioma ou a variantes regionais além de pt-BR e en.
- Persistência da escolha de idioma entre carregamentos, sessões ou dispositivos, por armazenamento local, cookie, conta ou perfil.
- Detecção automática do idioma pelo navegador, pelo cabeçalho da requisição ou por geolocalização.
- Endereços distintos por idioma, prefixos de rota, parâmetros de URL de idioma, `hreflang`, sitemap e demais otimizações de SEO multi-idioma.
- Conversão entre unidades métricas e imperiais, que permanece fora do escopo do produto.
- Tradução por serviço externo, tradução automática de conteúdo ou tradução de textos gerados por terceiros que não sejam a descrição de condição e a denominação de localidade.
- Localização de fuso horário, datas, horários extensos e calendários, que não são exibidos pelo painel.
- Tradução de logs, mensagens internas, documentação do repositório e conteúdo administrativo.
- Suporte a idiomas escritos da direita para a esquerda e às adaptações de layout correspondentes.
- Animações ou transições elaboradas para a troca de idioma além da atualização imediata do conteúdo.
